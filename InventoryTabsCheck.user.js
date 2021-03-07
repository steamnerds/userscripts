// ==UserScript==
// @name         Inventory Tabs Check
// @icon         https://store.steampowered.com/favicon.ico
// @namespace    SteamNerds
// @version      2.0
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
  if (!/^https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id\=873140323/.test(location.href)) {
    console.error("Inventory Tabs Check: The script was executed on an invalid page and thus terminated > Only run on " +
      "https://steamcommunity.com/sharedfiles/filedetails/?id=873140323");
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
        var cache = JSON.parse(rr.slice(rr.indexOf('g_rgAppContextData') + 21, rr.indexOf('g_strInventoryLoadURL') - 9));
        var [owned, av, ab, hid, nTotal, nVisible, nBroken] = [0, 0, 0, 0, 0, 0];
        var [unknownApps, misspelledApps] = [
          [],
          []
        ];
        var [cu, co, ca] = ['#3a3a3a', '#1d1d1d', '#0e141d'];
        var t2 = Date.now();

        for (var i = 0; i < $J('.bb_table_tr').length; i++) {
          //add new column header
          if ($J('.bb_table_tr')[i].children[0].classList.contains('bb_table_th')) {
            if (!$J('.bb_table_tr')[i].children[4]) { //prevent duplication on refresh
              $J("<div>", {
                "class": "bb_table_th",
                "text": "Links"
              }).appendTo($J('.bb_table_tr').get(i));
            }
          } else if ($J('.bb_table_tr')[i].children[0].classList.contains('bb_table_td')) { //read a single row
            var tmp = $J('.bb_table_tr')[i].children[0].innerText;
            var appid = /[A-z]/g.test(tmp) ? '' : tmp.replace(/\D/g, '');
            var visible = $J('.bb_table_tr')[i].children[2].innerText == 'Yes';
            if (appid != '') {
              tmp = $J('.bb_table_tr')[i].children[3].innerText;
              var obtainable = [tmp.includes('Buy'), tmp.includes('Drops'), tmp.includes('Trade'), tmp.includes('Broken')];
              var found = cache.hasOwnProperty(appid);
              if (!$J('.bb_table_tr')[i].children[4]) { //prevent duplication on refresh
                //add new link column
                $J("<div>", {
                  "class": "bb_table_td",
                  "style": "min-width: 158px;"
                }).append($J("<div>", {
                  "style": " display: flex; min-height: 28px;"
                }).append(
                  $J("<span>", {
                    "style": "max-width: 16px; padding: 5px 5px 0px 5px;  display: " + (found ? '' : 'none') + ";"
                  }).append(
                    $J("<a>", {
                      "href": "https://steamcommunity.com/my/inventory/#" + appid
                    }).append(
                      $J("<img>", {
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAC5ElEQVQ4y5WT30uUWRjHP+ecec13ppp0p0lmmmks6mIpNikiKFOECMp+EF4EXuw/sgS5FxHshlMN6+IQIcyFGZREEF70gywt/Ik6zozZNGq261qN77iO5jTuzfsugxrUFw4cznn48Jzv9zkCU8FQOCClbJBSnhFCOAHy+Xwmm13oGOjvvRxpuRkFFoEV1pECaLzRXKFpWreU8pAQoti6FEJsKCoq+tHr9dXruh4bjQ6/Az6vB1PBUDigaVq3EMKZyRhTba2R9qZQY/uD+/c6DMNI+v0Bj263l/p3lNfOpdN9k5Op98DSGtCp0+euSSkPZTLG1OVfL7aOJWLDQC/QP5FKvkzERzv3Vxyo1HX9B2dJSeD5syedwByQKwRJKeUZgPa7dx6n05+SQBfQA0SB6ORE6unI0GADgMez/SdgD7B5dUfSMvZF59MkEAPGAQP4Yi6j5Vb4NoCmacVAGbBxDahgvwTMAPOrzFwxzyzpgLYGlM/nMwCVVTXlfEXBUPgYwPLy8uLXamQ2u9ABcPLU2Vqff0e52bawCn5v/GOLUjIIMJFKxoEssLwmNfe2snGv11ev2+2l+ysOVHo83tnBgb7XQC4YCldrRdptKdW+XC6XbWuNPDxWVaNHR4ZerLZAAPr5ugunq2uO37LZbPp6bedyuWzznzciZ8/VHfZ4t++Nx6KXglevNAGz1hgo4MtodPjdXDrd5ywpCTgcG11KKZvlydvk+Ehba+ShBQFwubZWe70+0dvzatD8NnlRkN5mIGDOSZmZDkD2yNEq+4X6n39RSjkKO+3v67na3HT9N+AfVRDxkjmxfwEpYAyIA7HJiVS/w+Ho8fkDtVLK/6N3ubZWDA8NdBnG3N9qtR3Av8An8/2z5n4+OjI0LYR8vXPX7hMWTCllG0vEU9PTUwnFt2kF+DyWiKUKYR8+zH6MtNx8BCQF3ycJOAPluw663e6qVy+75oE3QPf3gizYJsBtBpIGZv4DopoXCNtbY3cAAAAASUVORK5CYII=',
                        "title": "Visit your inventory"
                      })))
                ).append(
                  $J("<span>", {
                    "style": "max-width: 16px; padding: 5px 5px 0px 5px;"
                  }).append(
                    $J("<a>", {
                      "href": "https://store.steampowered.com/app/" + appid
                    }).append(
                      $J("<img>", {
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACAklEQVQ4y41SPYgTQRR+u8sakhMkQgpPj3Sp7SwtjrO40h+wFSWFno2eIOYKwQgBkZzlIRba2Fx9iFxrp3aBxLO5BLLsbnBndrLM/4yFMawhG/zKN+/7eXzjwAKGp6cbF9bX7xpjthzHqc3GkeM4x+Px+F29Xh/BMuzcf+AKIdpaa2ELoLUWQoj27qPHzj/k/W7XRQgd2/9EmqZHrWctdy4ghOgULUspv8dxfAUAYDQa1bXWH621lnPe+XNcFDW01kWRca/Xu0QIOeCcP8EYf0iSZEMK8U0pZYNx0ADG2KsidyHEoRDiJkLoKgBAGIaVNE07lNLd2XvH9TxvEwrAOX/LOafW2vMAAEEQnPM8T7que2a2cg2SJNmTUgaL7pTS/ZzQXhiGLzHGXSllzRjTt9Zaxlg2d0MJuiGl/GSMiRlj7/v9fiWf5ufJyUVK6bZS6utfE874ZGn0KIpuE0KezsUR2jHGZIsplVJfAGN8j1LaQgjV8iKEkOvD4XBbCHG0ouLnIKWsWWszpZRmjDUHg8FlAIDpdNoihDwsIhtjMs55zfV9P86yrO15nut53uu1ytpm8it5gzHOyuXynaKGsix7USqV4vlAa32Qa0Ct+spKqYOlqoSQpjFmsiL2hBDSzHOcRRGE0NlSqXTLcZwt3/cbAABSyh8A8JlSelitVqf5/d/3+2maW12zaQAAAABJRU5ErkJggg==',
                        "title": "Visit store page"
                      })))).append(
                  $J("<span>", {
                    "style": "max-width: 16px; padding: 5px 5px 0px 5px;"
                  }).append(
                    $J("<a>", {
                      "href": "https://steamcommunity.com/app/" + appid
                    }).append(
                      $J("<img>", {
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1klEQVQ4y6WSsRHCMBAEF4YCXIKUK4BUEe7E7gAqYKgA04E7gA5wpNQEyqUSXAKJzDzGDGBfpp//lf50CwDnQwEovitao2tZWDgfTsCO31VZo/f9YfnnMMP+JRPkfNg6H9RkQFLrfFBzABlQzAEwZ4W7BFz/HG6AbX9YASUQU3E90jy8+QxcnkGSXwPcRHOZADKhCjiI2nH14Zlluq1Nbo+pA+oxE+vkyyFB4shgBWys0VGukAHKGn0fpC5Lq/X+NNbo/M2DL9GVkBfATzmwRndALv+/1wMRdDvjcj8B+wAAAABJRU5ErkJggg==',
                        "title": "Visit community hub"
                      })))
                ).append(
                  $J("<span>", {
                    "style": "max-width: 16px; padding: 5px 5px 0px 5px; opacity: " + (obtainable[2] ? 1 : 0.2) + ""
                  }).append(
                    $J("<a>", {
                      "href": "https://steamcommunity.com/market/search?appid=" + appid + "#p1_price_asc"
                    }).append(
                      $J("<img>", {
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABMUlEQVQ4y7WTPW7CQBCFPyMO4COQG5CSAgnLFwh0VGG77QJHyAlI6c50dISKDgXJhUs4AkegnB25SLOLDCHISMlU763mPc3fwn9EWZYvZVkOmuS2r4Qx8OVp8pBBURRxVVV7oAMk/X7/9JCBqk69+Jim6a5pu2cD59yrh8c7s4kBer3eubpotVp9AjEQhnYCDsBpNBoNrwxyoAskwaTtnHsH9rW8YPZcFxdFMa2qauLpHDAAEUCe5xMgr+UbY8wikO12O6htJ8QsTdOPKLAsy3JgAiystSa8bzabjq8wvjGWpBWQtdao6oUYQEQQkaGIzDxGRBYikojIMWq6ruVyWW9jOB6P1z8u8V6ISNfDgzFmffOUf4ssy2Ln3Jtf8UWLrSYGqjpX1Z2qPllrD3/6c78BeHWHF0YVFP4AAAAASUVORK5CYII=',
                        "title": "Visit market page"
                      })))
                ).append(
                  $J("<span>", {
                    "style": "max-width: 16px; padding: 5px 5px 0px 5px;  opacity: " + (obtainable[0] ? 1 : 0.2) + ""
                  }).append(
                    $J("<a>", {
                      "href": "https://store.steampowered.com/itemstore/" + appid + "/browse/?filter=All"
                    }).append(
                      $J("<img>", {
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABf0lEQVQ4y5XTPWuVQRAF4GdubhJNxIQ0ioqgYCFopbU/wEYExV5sAvZiYy92NoJg538wha2VXAwELQIaBaMgkqD4lQ9yLNzA6yVGHVjY2Zk5O2f2bCXpY9wvW6+qDf9jSa4l+ZBkJcmtJJNJJv51VZJxzOAC7uBzB7+Pzd38flWt4X2SJ/iI8/iBKVzB/U7BdTzAd4zgbr8TXOrMYSnJDFaraqlRLaziTVV9TbIHB7sA61jE1STz2IfTSS53ck7hYpI1TOBQF2ATL3CgdbMfK3jV4tsdvG4UzuBtb7u6qraw0G6eb2u5qgZVNcAAy3jW/C0s9oZedQEnsbdNvJdkNMlo80fQTzLW8hZrSBNTbQ5PW8tH8bKTcqJR2mrzuDkMMIbHrf3BXzS4hkf9ocPNRuMspncTMB5W1affAKpqK8k9XMIXfNuheAKTeLctzWE73JKmcKOq1oco3sYGjuB5bweA45hr+5Gh2LY/h2N/+p3TSWaTnGvy7caqnc8mmYaf+N7F8Rnd8HMAAAAASUVORK5CYII=',
                        "title": "Visit item shop"
                      })))
                ).append(
                  $J("<span>", {
                    "style": "max-width: 16px; padding: 5px 5px 0px 5px;"
                  }).append(
                    $J("<a>", {
                      "href": "https://steamdb.info/app/" + appid
                    }).append(
                      $J("<img>", {
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABvUlEQVQ4y42TPWzOURSHn/O+f026vL5LvETio2Eh5i5NJRLeCEZhEAk2JgwNo7FiENFBwlKEQUgHIgy1USRSESQ+IlEqfduGUNrHcoZ/itQvucO953fOufe59wYptRXoAhrAJmAp0Aa0AKPAW+AJcBu4GRHfAUIN4DBwEljAn3oBXAMKYAxYlE16IqIX9ZT/1jN1jXpAnacuV4+r6zPeXQFGgOvAa8Ds+gs4A3QAb4BPwEZgXe5oX/qOhLoQaEbElFoDVgM/gbnAu2ywHdidBVYlF4CBUNuBq8AP4BbQl+ctgB3AMaD2FzbPgUaRk5akvAs4CrxKWCtmJE0Dj4APQDtQDXUwr+1QRPSqi4ENwEpgfnJpJounEfFFPQicBx6ijiTRQbXOLFLr6uPM+Yy6V53MhVG1R+1Sl6lzctTVzepptZneSXUPaehX36vTzq6p9ParRQFcArYC+4E7QGcCWpLPWWAY+Ai8BO4BW4ALwEXU8ax8Wa38B4OKeiVzxlDPlbY3oG7LjzUzsVVtqA9K/rOoVfWEOlEKfFWH1Ps5htRvpfiE2q1Wo9ShBuzML722xIA8/3AyuAvciIhxgN/49Ki+wuORWAAAAABJRU5ErkJggg==',
                        "title": "Visit SteamDB"
                      })))
                )).appendTo($J('.bb_table_tr').get(i));
              }
              if (!found) {
                if (visible) {
                  $J('.bb_table_tr')[i].style.backgroundColor = ca;
                  $J('.bb_table_tr')[i].classList.add('ca');
                  av++;
                  ab += obtainable[3];
                } else {
                  $J('.bb_table_tr')[i].style.backgroundColor = cu;
                  $J('.bb_table_tr')[i].classList.add('cu');
                  hid++;
                }
              } else {
                $J('.bb_table_tr')[i].style.backgroundColor = co;
                $J('.bb_table_tr')[i].style.color = cu;
                $J('.bb_table_tr')[i].style.color = cu;
                $J('.bb_table_tr')[i].style.display = "none";
                $J('.bb_table_tr')[i].classList.add('co');
                owned++;
                cache[appid].matched = true;
                if ($J('.bb_table_tr')[i].children[1].innerTex != cache[appid].name) { //identify misspelled apps
                  misspelledApps.push(appid);
                }
              }
              [nTotal, nVisible, nBroken] = [++nTotal, nVisible + visible, nBroken + obtainable[3]]; //isn't js awesome?
            }
          }
        }
        for (var key in cache) { //test guide for accuracy
          if (cache[key].matched != true) {
            unknownApps.push(key);
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
              "html": "Total number of known inventories: " + nTotal + " (" + nVisible + " visible, " + (nTotal - nVisible) + " hidden or removed)<br>" +
                "Number of owned inventories: " + owned + " (" + (owned * 100 / nVisible).toFixed(1) + "%)<br>" +
                (Object.keys(cache).length == owned ? '' : "True number of owned invetories" +
                  '<span class="commentthread_subscribe_hint" data-tooltip-text="' +
                  'This is the number of tabs visible on your inventory page. The guide is likely missing entries.">' +
                  '(<span class="commentthread_subscribe_hint_q">?</span>)</span>: ' + Object.keys(cache).length) +
                "<br>Number inventories you are missing: " + (av) + ' (' + (av - ab) + ' working, ' + ab + ' broken)<br>'
            }).append($J("<a>", {
              "id": "",
              "onClick": '$J("#invTabsDetails").show();this.hide()',
              "html": 'Show more<br><br>'
            })).append($J("<div>", {
              "id": "invTabsDetails",
              "style": 'display: none;',
              "html": "<br>Matching errors" +
                '<span class="commentthread_subscribe_hint" data-tooltip-text="' +
                'Number of inventories which are either missing or are listed incorrectly.">' +
                '(<span class="commentthread_subscribe_hint_q">?</span>)</span>' +
                ": " + ((owned - Object.keys(cache).length + unknownApps.length) + unknownApps.length) +
                ' (' + unknownApps.length + ' missing entries, ' + (owned - Object.keys(cache).length + unknownApps.length) + ' duplicated entries)<br>' +
                ((Object.keys(cache).length == owned) && (unknownApps.length > 0) ? '' : "Inventories the guide is missing: " + unknownApps.toString() + '<br>') +
                (misspelledApps.length > 0 ? '' : "Misspelled apps: " + misspelledApps.toString() + '<br>') +
                "<br>" +
                "Time to load your inventory: " + (t2 - t1) + "ms<br>" +
                "Time to display the results: " + (Date.now() - t2) + "ms<br><br>"
            })).append(
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
                    "text": 'Unavailable (' + hid + ')'
                  })).append(
                  $J("<div>", {
                    "class": "bb_table_td",
                    "style": "background:" + ca + ";cursor:pointer",
                    "id": "ca",
                    "onClick": 'toggleInventories("ca");',
                    "text": 'Missing (' + av + ')'
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
