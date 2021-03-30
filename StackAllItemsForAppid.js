// https://github.com/steamnerds/userscripts

// Run multiple times if many items.
// Might have to scroll trough the inventory pages before it will work. (To make sure items are loaded into memory)
// Can most likely be cleaned up a lot, lol.

/*jshint esversion: 8 */


(() => {
  if (!/^https:\/\/steamcommunity\.com\/(id\/[\w-_]{1,64}|profiles\/\d{17})\/inventory/.test(location.href)) {
    console.error("You need to run this script on your inventory page");
    return false;
  }

  var [appid, context, webapikey, sleep, invDesc, invAssets, classidsToCombine] = [location.hash.substr(1).replace(/\D/g, ''), '', '', '', '', '', {}];
  appid = appid != '' ? appid : '753';
  ShowPromptDialog("Please enter the appid", "", "Continue", "Abort", '', appid).done((a) => {
    appid = a;
    let text = 'Here are the available context number for this app (usually only the number 2):<br><br>';
    for (var contextnr in g_rgAppContextData[appid].rgContexts) {
      if (g_rgAppContextData[appid].rgContexts.hasOwnProperty(contextnr)) {
        text += contextnr + ': ' + g_rgAppContextData[appid].rgContexts[contextnr].name + ' (' + g_rgAppContextData[appid].rgContexts[contextnr].asset_count + ')<br>';
      }
    }
    text += '<br>';
    ShowPromptDialog("Please enter the correct context number", text, "Continue", "Abort", '', '2').done((b) => {
      context = b;
      ShowPromptDialog("Please enter your Steam WebAPIkey", 'Enter the key listed here: <a href="https://steamcommunity.com/dev/apikey">https://steamcommunity.com/dev/apikey</a> <br><br>', "Continue", "Abort", '', '').done((c) => {
        webapikey = c;
        ShowPromptDialog("Time to sleep between api calls (in ms)", "", "Run", "Abort", '', '1000').done((d) => {
          sleep = d;
          invDesc = g_rgAppContextData[appid].rgContexts[context].inventory.m_rgDescriptions;
          invAssets = g_rgAppContextData[appid].rgContexts[context].inventory.m_rgAssets;
          //	console.log([appid, context, webapikey, sleep, invDesc, invAssets, classidsToCombine]);
          stackItems();
        });
      });
    });
  });

  document.location.href = document.location.href.split('#')[0] + "#" + appid;

  // Used function (GoToPage) from Augmented Steam browser extension by mistake, should work without it now.
  //g_ActiveInventory.GoToPage(g_ActiveInventory.m_cPages);


  async function stackItems() {
    ShowAlertDialog("Stacking items", '<div id="itemstacking"></div>');
    var key;
    var itemToPush = {};
    for (key in invDesc) {
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

      }
    }

    for (key in invAssets) {
      if (classidsToCombine.hasOwnProperty(invAssets[key].classid)) {
        itemToPush = {
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
        classidsToCombine[invAssets[key].classid].items[invAssets[key].assetid] = itemToPush;
      }
    }
    //console.log(classidsToCombine);

    var readyToCombine = {};
    for (key in classidsToCombine) {
      readyToCombine[classidsToCombine[key].classid] = [];
      for (var item in classidsToCombine[key].items) {
        if (classidsToCombine[key].items[item].hasOwnProperty("assetid")) {
          classid = classidsToCombine[key].items[item].classid;
          assetid = classidsToCombine[key].items[item].assetid;

          itemToPush = {
            assetid: classidsToCombine[key].items[item].assetid,
            amount: classidsToCombine[key].items[item].amount
          };

          //console.log(classidsToCombine[key]["items"][item]);
          //console.log(classidsToCombine[key]["items"][item].assetid);
          readyToCombine[classid].push(itemToPush);
        }
      }
    }
    //console.log(readyToCombine);

    if (Object.keys(readyToCombine).length == 0) {
      $J('#itemstacking').text('No items to stack');
    }
    for (key in readyToCombine) {
      for (i = 1; i < readyToCombine[key].length; i++) {
        //console.log(readyToCombine[key][i]);
        $J('#itemstacking').text('Stacking items: ' + i + '/' + (readyToCombine[key].length - 1));

        var url = "https://api.steampowered.com/IInventoryService/CombineItemStacks/v1/?key=" + webapikey +
          "&appid=" + appid + "&fromitemid=" + readyToCombine[key][i].assetid + "&destitemid=" + readyToCombine[key][0].assetid + "&quantity=" + readyToCombine[key][i].amount;
        var othePram = {
          headers: {
            "content-type": "application/json; charset=UTF-8"
          },
          method: "POST",
          mode: "no-cors"
        };


        //console.log("url: " + url);

        fetch(url, othePram)
          .then(data => {
            console.log(data);
            return data.json;
          })
          .catch(error => console.log(error));

        await new Promise(r => setTimeout(r, sleep));
      }
      $J('#itemstacking').text('Stacking items complete');
    }
  }
})();

// Legal Disclaimer
// THESE SCRIPTS AND EXAMPLE FILES ARE PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTIBILITY AND FITNESS FOR A PARTICULAR PURPOSE.
// UNDER NO CIRCUMSTANCES SHALL PARLIANT CORPORATION BE LIABLE TO YOU OR ANY OTHER PERSON FOR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND RELATED TO OR ARISING OUT OF YOUR USE OF THE SCRIPTS AND EXAMPLE FILES, EVEN IF PARLIANT CORPORATION HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES.
