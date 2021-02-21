// ==UserScript==
// @name         Inventory Tabs Check
// @icon         https://store.steampowered.com/favicon.ico
// @namespace    SteamNerds
// @version      1.3.1
// @description  Highlights missing inventory tabs in Blueberry's guide
// @author       uniQ
// @include      /^https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id\=873140323/
// @updateURL    https://raw.githubusercontent.com/steamnerds/userscripts/master/InventoryTabsCheck.user.js
// @grant        none
// ==/UserScript==
// https://github.com/steamnerds/userscripts
/*jshint esversion: 6 */

function getInventory() {
  if (!g_steamID) {
    console.error("Inventory Tabs Check: Not logged into Steam");
    return;
  }
  if ($J('#tabcheck').length > 0) {
    $J('#tabCheckRefresh').attr('src', 'https://community.akamai.steamstatic.com/public/images/login/throbber.gif');
    $J('#tabCheckRefresh').attr('onClick', '');
  }
  var t1 = Date.now();
  jQuery.ajax({
    type: 'GET',
    url: "https://steamcommunity.com/my/inventory/",
    success: function(r) {
      if (r != "") {
        handleResponse(r, t1);
      } else {
        console.log("There was an error while trying to load your Steam inventory");
      }
    },
    error: function() {
      console.log("There was an error while trying to load your Steam inventory");
    }
  });

  function handleResponse(rr, t1) {
    try {
      if (rr.includes("g_strInventoryLoadURL") && rr.includes('id="inventory_link_753"')) {
        var useLevenshteinDistance = true; // mapping in case of spelling mistakes
        var cache = JSON.parse(rr.slice(rr.indexOf('g_rgAppContextData') + 21, rr.indexOf('g_strInventoryLoadURL') - 9));
        var total = 0;
        var owned = 0;
        var av = 0;
        var nav = 0;
        var cu = '#3a3a3a';
        var co = '#1d1d1d';
        var ca = '#66C0F4';
        var t2 = Date.now();
        const levenshtein = (a, b) => { //https://gist.github.com/andrei-m/982927#gistcomment-1931258
          if (a.length === 0) return b.length;
          if (b.length === 0) return a.length;
          let tmp, i, j, prev, val, row;
          if (a.length > b.length) {
            tmp = a;
            a = b;
            b = tmp;
          }
          row = Array(a.length + 1);
          for (i = 0; i <= a.length; i++) {
            row[i] = i;
          }
          for (i = 1; i <= b.length; i++) {
            prev = i;
            for (j = 1; j <= a.length; j++) {
              if (b[i - 1] === a[j - 1]) {
                val = row[j - 1];
              } else {
                val = Math.min(row[j - 1] + 1,
                  Math.min(prev + 1,
                    row[j] + 1));
              }
              row[j - 1] = prev;
              prev = val;
            }
            row[a.length] = prev;
          }
          return row[a.length];
        };

        for (var i = 0; i < $J('.bb_table_td').length; i++) {
          if ($J('.bb_table_td')[i].children[0]) {
            var a = $J('.bb_table_td')[i].children[0].href;
            a = a.includes('steam://openurl/') ? a.substring(16, a.length) : a;
            $J('.bb_table_td')[i].children[0].href = a;
            if (a != "undefined") {
              total++;
              a = $J('.bb_table_td')[i].children[0].innerText;
              var found = false;
              for (var app in cache) {
                var distance = useLevenshteinDistance ? levenshtein(cache[app].name.toLowerCase(), a.toLowerCase()) : Math.min();
                if ((cache[app].name.toLowerCase() == a.toLowerCase()) || (distance <= 2 && cache[app].name.length > 6)) {
                  found = true;
                }
              }
              if (!found) {
                if ($J('.bb_table_td')[i].parentNode.children[1].innerText == 'Yes') {
                  $J('.bb_table_td')[i].parentNode.style.backgroundColor = ca;
                  $J('.bb_table_td')[i].childNodes[0].style.color = co;
                  $J('.bb_table_td')[i].parentNode.style.color = co;
                  $J('.bb_table_td')[i].parentNode.classList.add('ca');
                  av++;
                } else {
                  $J('.bb_table_td')[i].parentNode.style.backgroundColor = cu;
                  $J('.bb_table_td')[i].parentNode.classList.add('cu');
                  nav++;
                }
              } else {
                $J('.bb_table_td')[i].parentNode.style.backgroundColor = co;
                $J('.bb_table_td')[i].childNodes[0].style.color = cu;
                $J('.bb_table_td')[i].parentNode.style.color = cu;
                $J('.bb_table_td')[i].parentNode.style.display = "none";
                $J('.bb_table_td')[i].parentNode.classList.add('co');
                owned++;
              }
            }
          }
        }
        if ($J('#tabcheck').length > 0) {
          $J('#tabcheck').remove();
        }
        $J('#2956077').append(
          $J("<div>", {
            "class": "subSection detailBox",
            "id": "tabcheck"
          }).append(
            $J("<div>", {
              "class": "subSectionTitle",
              "text": 'Inventory Tab Check'
            }).append(
              $J("<img>", {
                "src": "https://steamcommunity-a.akamaihd.net/public/shared/images/header/inbox_tradeoffers.png",
                "style": "padding-left: 10px;vertical-align:middle;height:16px;width:16px",
                "onClick": 'getInventory();',
                "title": 'Refresh',
                "id": 'tabCheckRefresh'
              }))).append(
            $J("<br>")).append(
            $J("<div>", {
              "class": "subSectionDesc",
              "html": "Total number of inventories listed: " + total + "<br>" +
                "Number of owned inventories listed: " + owned + "<br>" +
                "True number of owned invetories: " + Object.keys(cache).length + "<br>" +
                "Number of unmatched inventories listed" +
                '<span class="commentthread_subscribe_hint" data-tooltip-text="' +
                'Number of owned inventories which could not be found despite tolerances.">' +
                '(<span class="commentthread_subscribe_hint_q">?</span>)</span>' +
                ": " + (Object.keys(cache).length - owned) + "<br>" +
                "Estimated number of missing inventories" +
                '<span class="commentthread_subscribe_hint" data-tooltip-text="' +
                'Misspelled or changed names can cause false-positives. ' +
                'The script tries to auto-correct which can cause false-negatives.">' +
                '(<span class="commentthread_subscribe_hint_q">?</span>)</span>' +
                ": " + Math.floor((2 * total - Object.keys(cache).length - owned) / 2) +
                " ±" + Math.ceil((Object.keys(cache).length - owned) / 2) +
                " (" + av + " available, " + nav + " unavailable)" + "<br><br>" +
                "Time to load your inventory: " + (t2 - t1) + "ms<br>" +
                "Time to display the results: " + (Date.now() - t2) + "ms<br><br>"
            }).append(
              $J("<div>", {
                "class": "bb_table"
              }).append(
                $J("<div>", {
                  "class": "bb_table_tr"
                }).append(
                  $J("<div>", {
                    "class": "bb_table_td",
                    "style": "background: " + co + ";opacity: 0.2;cursor:pointer",
                    "id": "co",
                    "onClick": 'toggleInventories("co");',
                    "text": 'Already owned (' + owned + ')'
                  })).append(
                  $J("<div>", {
                    "class": "bb_table_td",
                    "style": "background: " + cu + ";cursor:pointer",
                    "id": "cu",
                    "onClick": 'toggleInventories("cu");',
                    "text": 'Missing but unavailable (' + nav + ')'
                  })).append(
                  $J("<div>", {
                    "class": "bb_table_td",
                    "style": "background:" + ca + ";color:" + co + ";cursor:pointer",
                    "id": "ca",
                    "onClick": 'toggleInventories("ca");',
                    "text": 'Missing and available (' + av + ')'
                  }))
              )))).append(
          $J("<div>", {
            "style": 'clear: both'
          }));
        return true;
      } else {
        ShowAlertDialog("Error", "An error occurred while trying to retrieve your inventory");
      }
    } catch (e) {
      console.log(e);
      ShowAlertDialog("Error", "An error occurred while trying to retrieve an inventory");
      return false;
    }
  }
}

function toggleInventories(i) {
  if ($J('#' + i).css('opacity') == "1") {
    $J('#' + i).css('opacity', '0.2');
    $J('.' + i).css('display', 'none');
  } else {
    $J('#' + i).css('opacity', '1');
    $J('.' + i).css('display', '');
  }

}

(() => {
  var script = document.createElement('script');
  script.innerHTML = "" +
    toggleInventories.toString() +
    getInventory.toString() + "(() => getInventory())()";
  document.body.appendChild(script);
})();
