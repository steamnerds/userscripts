// ==UserScript==
// @name         Inventory Tabs Check
// @icon         https://store.steampowered.com/favicon.ico
// @namespace    SteamNerds
// @version      2.2
// @description  Highlights missing inventory tabs in Blueberry's guide
// @author       uniQ
// @include      /^https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id\=873140323/
// @include      /^https:\/\/steamcommunity\.com\/(id\/\w{1,64}|profiles\/\d{17})\/inventory/
// @updateURL    https://raw.githubusercontent.com/steamnerds/userscripts/master/InventoryTabsCheck.user.js
// @grant        none
// ==/UserScript==
// https://github.com/steamnerds/userscripts
/*jshint esversion: 6 */

function runInventoryTabCheck() {
  if (!g_steamID) {
    log(Style.warn, "Inventory Tabs Check: Not logged into Steam");
    return;
  }
  if ($J('#tabcheck').length > 0) {
    $J('#tabCheckRefresh').attr('src', 'https://community.akamai.steamstatic.com/public/images/login/throbber.gif');
    $J('#tabCheckRefresh').attr('onClick', '');
  }

  var t1 = Date.now();

  jQuery.ajax({
    type: 'GET',
    url: "https://steamcommunity.com/groups/InventoryItemCollectors/discussions",
    success: (r) => {
      if (r != "") {
        var r1 = {};
        // create a value key pair of name and discussion userList
        r.replace(/<a href=\"https:\/\/steamcommunity\.com\/groups\/InventoryItemCollectors\/discussions\/\d+\/\">((?!<\/a>).|\n|\t|\r)*<\/a>/gm, (a) => {
          r1[a.substring(a.indexOf('/">') + 3, a.indexOf('</a>')).replace(/[\t\n\r]/g, '').toLowerCase()] = a.substring(a.indexOf('https://steamcommunity.com/groups/InventoryItemCollectors/discussions/') + 70, a.indexOf('/">'));
        });
        getInventory(r1, t1);
      } else {
        log(Style.warn, "There was an error while trying to load the Steam Inventory group");
        getInventory({}, t1);
      }
    },
    error: () => {
      log(Style.warn, "There was an error while trying to load the Steam Inventory group");
      getInventory({}, t1);
    }
  });

  function getInventory(r1, t1) {
    jQuery.ajax({
      type: 'GET',
      url: "https://steamcommunity.com/my/inventory/",
      success: (r) => {
        if (r != "") {
          handleResponse(r1, r, t1);
        } else {
          log(Style.warn, "There was an error while trying to load your Steam inventory");
        }
      },
      error: () => {
        log(Style.warn, "There was an error while trying to load your Steam inventory");
      }
    });
  }

  function handleResponse(r1, r2, t1) {
    try {
      if (r2.includes("g_strInventoryLoadURL") && r2.includes('id="inventory_link_753"')) {
        var cache = JSON.parse(r2.slice(r2.indexOf('g_rgAppContextData') + 21, r2.indexOf('g_strInventoryLoadURL') - 9));
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
                //add discussion Links
                if (r1.hasOwnProperty($J('.bb_table_tr')[i].children[1].innerText.toLowerCase())) {
                  $J('.bb_table_tr')[i].children[1].innerHTML = '<a id="invGroupUrl' + appid + '" class="invGroupUrl" href="https://steamcommunity.com/groups/InventoryItemCollectors/discussions/' + r1[$J('.bb_table_tr')[i].children[1].innerText.toLowerCase()] + '/">' + $J('.bb_table_tr')[i].children[1].innerHTML + '</a>';
                }

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
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA0UlEQVQ4y9XTMUpDQRSF4W9enoVoq0VEsErjBqysBMkiBIsswMXYCkI6+wQiNga3oIWVTSBlQAsJJNdmAkPgKcQqpxnOz8y5d+YybL3SOoiIFvo4xSLjCm+4Siktyv11RLTRLcJaOMMtZpnt4wa9iFgFBEYi4i42V7/CYdHRCONfrjzGU+EPajximsED9vDeEDDANz6yf63w8o8hPNc4QS+DY+zivOFAB3NcZD+s82uudPlHxfXgqPCF5QbtL/GZImIH1zgq5puKtYlNcL/9f8kPHadvc+IogacAAAAASUVORK5CYII=',
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
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABnUlEQVQ4y7VTPYsUQRB9/bG9A7omCvcbBF3BWPwBhwf+BDk/Ev+DibFgciaKkWgmiHKhgRgrmNwhxgo3HgfbvcNUTVeXycwxrLuIwTV0UK/rFfV4r4GzODHGK2uwq/8kNk3zlJmFmZWIDgaciA6YWZk5L5fLJ2OOHRfOud0BU9WjAVfVemjx3t8dc/y4MMacAwAReVtK+UFERwCQc36pqsfOudvGmPMbJbRt+5mZebFY3Gfmrl9bmbnrsdy27aeNEqqquiEi+9baSyvbeWvtRRHZr6rq5toBKaUHRFQ753ZKKTWAbtTHIvLbOXeLiOqU0r1T2b1F8+l0+gWA6zU/V9Xae/8QgOac94wxW977gShEdH02m32zABBCeKOqEUAnIu9E5LtzbtsYMzPGXHDObYvIoYi8B9CpagohvD7dgJk15/zCWns55/whhPB41SEATESPJpPJTinl0Hu/G0KwQ4CejULzi5nLyIHhFiL6OQrd3l82ppTuMLM2TfNqdcCAxRivbbRRVb+WUj4COFkTk+P+Tf/nU81jjHOc5fkDm1grbX5l5DcAAAAASUVORK5CYII=',
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
                        "src": 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB/klEQVQ4y61TPYsaURQ982aGyQjhTWZ4M8EIo6aRsXJgm+0kRX6AVZIubSSFEslaaSHpREGwSKO1EfwJaxfYMMXWMiASBA1PA34gi7MpsgPGbIKQ3OryDve+c+85F/jHEABA07RHhJAAABhj9nw+HwOAIAgiIQT7/X5/jAVBQJbL5QIAoOs6DTu6rnsW5pqmKYZhKPdhYQ05lWo2m43mcrlnx+8SAJimacfjcQUALMtyXNcFABBCZEEQYNv2TaVSaSSTyXNCyL7X611uNpsd5/xaAoDZbDbmnH+/ownP867CEWRZBmNMXCwW30aj0WdFUQTP865+GUEUxcifqFuW9bBUKn0ol8svi8XiW9/3v1Sr1deSJP3cTavVuphMJrflcvkFpVRxXfecUqpQShXHcWLdbvej4ziPD7F2u10Zj8e3zWbzvRT+FI1Gn6qqClmWoaoqLMuihULhotFoVDjni0NsOp1OCDnYv2maZrVafZXP55+7rnvmOE6k0+k00uk0u09GSqnAGDNxrGm9Xn8zHA69wWDwKZVKRTRNUxhjf/WBBACGYdi2bSvb7TaSTCYzvu9vVVVNJxIJWRRFxGKxmzsnOplMBgCwWq12nPPr35xYq9XeZbPZJ6c6UTqWrd/vX3qe9/VUh0rhYYQd1+v1LszDY9J1/cExFgQBwf+IHy2Yrc9yT7lBAAAAAElFTkSuQmCC',
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
                "onClick": 'runInventoryTabCheck();',
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
                "Time to load resources: " + (t2 - t1) + "ms<br>" +
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
      log(Style.warn, e);
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

function displayInventoryFeatures() {
  let inventoryLists = document.getElementsByClassName('games_list_separator responsive_hidden'); // display inventory numbers for each section
  let hideInvTab = () => {
    $J('#games_list_public').toggle();
  };
  for (var j = 0; j < inventoryLists.length; j++) {
    inventoryLists[j].childNodes[0].textContent = inventoryLists[j].childNodes[0].textContent.replace(/<br>/gi, '') + ':  ' + document.getElementsByClassName('games_list_tabs_ctn responsive_hidden')[j].getElementsByClassName('games_list_tab').length;
    if (j == 0) { //add functions to the active inventory section
      inventoryLists[j].onclick = hideInvTab;
      inventoryLists[j].addClassName('actionable');
      inventoryLists[j].innerHTML += '<div class="arrow">&nbsp;</div>';
    }
  }
}


function initialize() {
  var Style = { //from simplernerd
    base: [
      "color: #8f98a0",
      "background-color: #1b2838)",
      "padding: 2px 4px",
      "border-radius: 2px"
    ],
    warn: [
      "color: #a94847"
      //"background-color: rgba(34, 35, 48, 0.93)"
    ],
    good: [
      "color: #66C0F4",
      "background-color: #1b2838"
    ]
  };
  let log = (extra, text) => {
    let style = Style.base.join(';') + ';';
    style += extra.join(';');
    console.log(`%c${text}`, style);
  };

  var url = window.location.href;
  switch (true) {
    case /^https:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/\?id\=873140323/.test(url): // guide
      runInventoryTabCheck();
      break;
    case /^https:\/\/steamcommunity\.com\/(id\/[\w-_]{1,64}|profiles\/\d{17})\/inventory/.test(url): // inventory page
      displayInventoryFeatures();
      break;
    default:
      log(Style.warn, "Inventory Tabs Check: The script was executed on an invalid page and thus terminated > Only run on " +
        "https://steamcommunity.com/sharedfiles/filedetails/?id=873140323 or an inventory page");
  }
}

(() => {
  var script = document.createElement('script');
  script.innerHTML = "" +
    toggleInventories.toString() +
    initialize.toString() +
    runInventoryTabCheck.toString() + "(() => initialize())()";
  document.body.appendChild(script);
})();
