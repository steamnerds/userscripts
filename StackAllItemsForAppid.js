// https://github.com/steamnerds/userscripts

// Run multiple times if many items.
// Might have to scroll trough the inventory pages before it will work. (To make sure items are loaded into memory)
// Can most likely be cleaned up a lot, lol.

var appid = prompt("Please enter the appid", "753");
var context = prompt("Please enter the context number (Most likely 2)", "2");
var webapikey = prompt("Please enter your Steam WebAPIkey - https://steamcommunity.com/dev/apikey", "https://steamcommunity.com/dev/apikey");
var sleep = prompt("Time to sleep between api calls (in ms)", "250");

document.location.href = document.location.href.split('#')[0] + "#" + appid;

// Used function (GoToPage) from Augmented Steam browser extension by mistake, should work without it now.
//g_ActiveInventory.GoToPage(g_ActiveInventory.m_cPages);

var classidsToCombine = {};
var invDesc = g_rgAppContextData[appid].rgContexts[context].inventory.m_rgDescriptions;
var invAssets = g_rgAppContextData[appid].rgContexts[context].inventory.m_rgAssets;


async function stackItems() {
	for (var key in invDesc) {
		if (invDesc[key].use_count > 1) {
			//console.log("classid '" + invDesc[key].classid + "' has " + invDesc[key].use_count + " counts.");
			var classidToPush = {
				name: invDesc[key].name,
				type: invDesc[key].type,
				use_count: invDesc[key].use_count,
				classid: parseInt(invDesc[key].classid),
				items: []
			};
			classidsToCombine[invDesc[key].classid] = classidToPush;
			
		};
	};

	for (var key in invAssets) {
		if (classidsToCombine.hasOwnProperty(invAssets[key].classid)) {
			var itemToPush = {
				//appid: invAssets[key].appid,
				//contextid: invAssets[key].contextid,
				assetid: invAssets[key].assetid,
				classid: invAssets[key].classid,
				//instanceid: invAssets[key].instanceid,
				amount: invAssets[key].amount,
				//is_currency: invAssets[key].is_currency,
				original_amount: invAssets[key].original_amount
				//is_stackable: invAssets[key].is_stackable
			};
			classidsToCombine[invAssets[key].classid]["items"][invAssets[key].assetid] = itemToPush;
		};
	};
	//console.log(classidsToCombine);

	var readyToCombine = {};
	for (var key in classidsToCombine) {
		readyToCombine[classidsToCombine[key].classid] = [];
		for (item in classidsToCombine[key]["items"]) {
			if (classidsToCombine[key]["items"][item].hasOwnProperty("assetid")) {
				classid = classidsToCombine[key]["items"][item].classid;
				assetid = classidsToCombine[key]["items"][item].assetid;
				
				var itemToPush = {
				assetid: classidsToCombine[key]["items"][item].assetid,
				amount: classidsToCombine[key]["items"][item].amount
			};
				
				//console.log(classidsToCombine[key]["items"][item]);
				//console.log(classidsToCombine[key]["items"][item].assetid);
				readyToCombine[classid].push(itemToPush);
			};
		};
	};
	//console.log(readyToCombine);

	for (var key in readyToCombine) {
		for (i = 1; i < readyToCombine[key].length; i++) {
			//console.log(readyToCombine[key][i]);
			
			var url = "https://api.steampowered.com/IInventoryService/CombineItemStacks/v1/?key=" + webapikey + 
			"&appid=" + appid + "&fromitemid=" + readyToCombine[key][i].assetid + "&destitemid=" + readyToCombine[key][0].assetid + "&quantity=" + readyToCombine[key][i].amount;
			var othePram = {
				headers: {
					"content-type":"application/json; charset=UTF-8"
				},
				method: "POST",
				mode: "no-cors"
			};

		
			//console.log("url: " + url);

			fetch(url, othePram)
			.then(data=>{return data.json})
			.then(res=>{console.log(res)})
			.catch(error=>console.log(error))
			
			await new Promise(r => setTimeout(r, sleep));
		};
	};
};
stackItems();

// Legal Disclaimer
// THESE SCRIPTS AND EXAMPLE FILES ARE PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTIBILITY AND FITNESS FOR A PARTICULAR PURPOSE.
// UNDER NO CIRCUMSTANCES SHALL PARLIANT CORPORATION BE LIABLE TO YOU OR ANY OTHER PERSON FOR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND RELATED TO OR ARISING OUT OF YOUR USE OF THE SCRIPTS AND EXAMPLE FILES, EVEN IF PARLIANT CORPORATION HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES.
