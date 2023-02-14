// https://github.com/steamnerds/userscripts

// Execute while having the inventory you want to unstack all items for open.
// Might have to scroll trough the inventory pages before it will work.
// If many stacked items, might have to run it a few times before all are unstacked (not sure why, maybe rate limits, since I have no pauses at all)
// EDIT: Added a pause between API calls :P

/*jshint esversion: 8 */

(() => {
  if (!/^https:\/\/steamcommunity\.com\/(id\/[\w-_]{1,64}|profiles\/\d{17})\/inventory/.test(location.href)) {
    console.error("You need to run this script on your inventory page");
    return false;
  }

  var [appid, context, webapikey, sleep, invAssets] = [location.hash.substr(1).replace(/\D/g, ''), '', '', '', ''];
  appid = appid != '' ? appid : '753';
  ShowPromptDialog("Please enter the appid", "", "Continue", "Abort", '', appid).done((a) => {
    appid = a;
    let text = 'Here are the options for this app (usually only the number 2):<br><br>';
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
          invAssets = g_rgAppContextData[appid].rgContexts[context].inventory.m_rgAssets;
          splitItems();
        });
      });
    });
  });

  document.location.href = document.location.href.split('#')[0] + "#" + appid;
  //g_ActiveInventory.GoToPage(g_ActiveInventory.m_cPages);


  async function splitItems() {
    ShowAlertDialog("Splitting items", '<div id="itemstacking"></div>');

    var n = 0;
    for (var key in invAssets) {
      itemid = invAssets[key].assetid;
      quantity = invAssets[key].amount;
      n++;

      if (quantity > 1) {
        console.log("itemid: " + itemid + " -- quantity: " + (quantity - 1));

        for (i = 1; i < quantity; i++) {
          //console.log("test");
          $J('#itemstacking').text('Splitting items: ' + i + '/' + quantity);
          var url = "https://api.steampowered.com/IInventoryService/SplitItemStack/v1/?key=" + webapikey + "&appid=" + appid + "&itemid=" + itemid + "&quantity=1";
          //var data = {
          //	appid: appid,
          //	itemid: itemid,
          //	quantity: "1"
          //};
          var othePram = {
            headers: {
              "content-type": "application/json; charset=UTF-8"
            },
            //body: data,
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
      } else {
        $J('#itemstacking').text('No items left to split');
      }
    }
  }
})();


// Legal Disclaimer
// THESE SCRIPTS AND EXAMPLE FILES ARE PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTIBILITY AND FITNESS FOR A PARTICULAR PURPOSE.
// UNDER NO CIRCUMSTANCES SHALL PARLIANT CORPORATION BE LIABLE TO YOU OR ANY OTHER PERSON FOR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND RELATED TO OR ARISING OUT OF YOUR USE OF THE SCRIPTS AND EXAMPLE FILES, EVEN IF PARLIANT CORPORATION HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES.
