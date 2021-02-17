// ==UserScript==
// @name         Inventory Tabs Check
// @icon         https://store.steampowered.com/favicon.ico
// @namespace    SteamNerds
// @version      1.0
// @description  Highlights missing inventory tabs in Blueberry's guide
// @author       uniQ
// @include      /^https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id\=873140323/
// @updateURL    https://raw.githubusercontent.com/steamnerds/userscripts/master/InventoryTabsCheck.user.js
// @grant        none
// ==/UserScript==
// https://github.com/steamnerds/userscripts
/*jshint esversion: 6 */

function getInventory() {
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
        var cache = JSON.parse(rr.slice(rr.indexOf('g_rgAppContextData') + 21, rr.indexOf('g_strInventoryLoadURL') - 9));
        var total = 0;
        var owned = 0;
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
                var distance = levenshtein(cache[app].name.toLowerCase(), a.toLowerCase()); // mapping in case of spelling mistakes
                if ((cache[app].name.toLowerCase() == a.toLowerCase()) || (distance <= 2 && cache[app].name.length > 6)) {
                  found = true;
                  owned++;
                }
              }
              if (!found) {
                if ($J('.bb_table_td')[i].parentNode.children[1].innerText == 'Yes') {
                  $J('.bb_table_td')[i].parentNode.style.backgroundColor = ca;
                  $J('.bb_table_td')[i].childNodes[0].style.color = co;
                  $J('.bb_table_td')[i].parentNode.style.color = co;
                } else {
                  $J('.bb_table_td')[i].parentNode.style.backgroundColor = cu;
                }
              } else {
                $J('.bb_table_td')[i].parentNode.style.backgroundColor = co;
                $J('.bb_table_td')[i].childNodes[0].style.color = cu;
                $J('.bb_table_td')[i].parentNode.style.color = cu;
              }
            }
          }
        }
        $J('#2956077').append(
          $J("<div>", {
            "class": "subSection detailBox"
          }).append(
            $J("<div>", {
              "class": "subSectionTitle",
              "text": 'Inventory Tab Check'
            })).append(
            $J("<br>")).append(
            $J("<div>", {
              "class": "subSectionDesc",
              "html": "Total number of inventories listed: " + total + "<br>" +
                "Number of owned inventories listed: " + owned + "<br>" +
                "Number of missing or unmatched inventories listed" +
                '<span class="commentthread_subscribe_hint" data-tooltip-text="' +
                'Misspelled or changed names can cause misses. The script tries to auto-correct which can cause false-positives.">' +
                '(<span class="commentthread_subscribe_hint_q">?</span>)</span>' +
                ": " + (total - owned) + "<br>" +
                "True number of owned invetories: " + Object.keys(cache).length + "<br><br>" +
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
                    "style": "background: " + co,
                    "text": 'Already owned'
                  })).append(
                  $J("<div>", {
                    "class": "bb_table_td",
                    "style": "background: " + cu,
                    "text": 'Missing, but unavailable'
                  })).append(
                  $J("<div>", {
                    "class": "bb_table_td",
                    "style": "background:" + ca + "; color:" + co,
                    "text": 'Missing and available'
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

(() => {
  if (!g_steamID) {
    console.error("Inventory Tabs Check: Not logged into Steam");
    return;
  }
  var script = document.createElement('script');
  script.innerHTML = "(" + getInventory.toString() + ")()";
  document.body.appendChild(script);
})();
