// https://github.com/steamnerds/userscripts

// Execute while having the inventory you want to unstack all items for open.
// Might have to scroll trough the inventory pages before it will work.
// If many stacked items, might have to run it a few times before all are unstacked (not sure why, maybe rate limits, since I have no pauses at all)
// EDIT: Added a pause between API calls :P

var appid = prompt("Please enter the appid", "753");
var context = prompt("Please enter the context number (Most likely 2)", "2");
var webapikey = prompt("Please enter your Steam WebAPIkey - https://steamcommunity.com/dev/apikey", "https://steamcommunity.com/dev/apikey");
var sleep = prompt("Time to sleep between api calls (in ms)", "1000");

document.location.href = document.location.href.split('#')[0] + "#" + appid;
//g_ActiveInventory.GoToPage(g_ActiveInventory.m_cPages);

invAssets = g_rgAppContextData[appid].rgContexts[context].inventory.m_rgAssets;

async function splitItems() {
    for (var key in invAssets) {
	    itemid = invAssets[key].assetid;
	    quantity = invAssets[key].amount;

	    if (quantity > 1) {
		    console.log("itemid: " + itemid + " -- quantity: " + quantity);

		    for (i = 1; i < quantity; i++) {
			    //console.log("test");
			
			    var url = "https://api.steampowered.com/IInventoryService/SplitItemStack/v1/?key=" + webapikey + "&appid=" + appid + "&itemid=" + itemid + "&quantity=1";
			    //var data = {
			    //	appid: appid,
			    //	itemid: itemid,
			    //	quantity: "1"
			    //};
			    var othePram = {
				    headers: {
					    "content-type":"application/json; charset=UTF-8"
				    },
				    //body: data,
				    method: "POST",
				    mode: "no-cors"
			    };

			    //console.log("url: " + url);

			    fetch(url, othePram)
			    .then(data=>{return data.json})
			    .then(res=>{console.log(res)})
			    .catch(error=>console.log(error))
			
			    await new Promise(r => setTimeout(r, sleep));
		    }
	    }
    }
}

splitItems();

// Legal Disclaimer
// THESE SCRIPTS AND EXAMPLE FILES ARE PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTIBILITY AND FITNESS FOR A PARTICULAR PURPOSE.
// UNDER NO CIRCUMSTANCES SHALL PARLIANT CORPORATION BE LIABLE TO YOU OR ANY OTHER PERSON FOR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND RELATED TO OR ARISING OUT OF YOUR USE OF THE SCRIPTS AND EXAMPLE FILES, EVEN IF PARLIANT CORPORATION HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES.
