/**
 * Original code is from RenokK https://gist.github.com/HiveSolution/54e0ad1cee00addbb42b698ff8f2fe42
 * moved here for easier maintenance
 * 
 * @name Steam Inventory broken Tabs enabler
 * @description Activate all currently known broken inventory tabs
 * @version 1.0.4
 * @author RenokK, uniQ
 * @website https://steamcommunity.com/groups/InventoryService/discussions/0/1711816348630251347/
 */

const useFallbackIDs = false; //change this to true, if you want the script to only use the appIds listed below; enabling this will skip looking up the Steam group post
const skipInventorySearch = false; //change this to true if you do not want the script to check for already owned inventories; enabling this can cause unnecessary buy requests
const debugOnly = false; //change this to true if you want to skip buying items and see additional console output

// last updated: 2023.02.18
let appIds = [
  961210, 912210, 870000, 973780, 714360, 2004920, 411480, 686090, 652410, 1959960, 1112870,
  1064880, 743920, 1245900, 908330, 797180, 688880, 814310, 1216530, 2112730, 2152630, 1699740,
  750800, 1313340, 854400, 1816880, 824290, 1444570, 848010, 860940, 2124390, 1648840, 1337300,
  857790, 1866220, 737630, 1172040, 752760, 857840, 1823590, 882370, 1821580, 612660, 2013680,
  1720750, 2153990, 899230, 1664900, 2258440, 1231210, 1335580, 1642600, 1258180, 613730,
  1441880, 1353590, 1774100, 1643530, 440000, 1930340, 1184790, 1352080, 1213530, 1385790,
  554710, 1577150, 1471420, 1651680, 733430, 614940, 1340810, 1366160, 809200, 1260430, 821110,
  820160, 2081110, 971450, 781790, 1391690, 451230, 576430, 1846370, 1649980, 1416190, 1117210,
];

let Inventory = [];

const buy = (appId) => {
  return new Promise((resolve, reject) => {
    $J.post("https://steamcommunity.com/market/createbuyorder/", {
      sessionid: g_sessionID,
      currency: 3,
      appid: appId,
      market_hash_name: "Steam+Inventory+Service",
      price_total: 3,
      quantity: 1,
    }).done((data) => {
      log('warning', 'Steam returned the follow message for' + appId + ': ' + data.message);
      resolve();
    });
  });
};

const buyAll = async () => {
  if (appIds.length == 0) {
    log('good', "You already own all known inventories.")
  } else {
    log('good', "Buying the following inventories: " + appIds)
    if (debugOnly) {
      log('warning', 'debugOnly flag active. No items will be purchased');
    } else {
      for (let i = 0; i < appIds.length; i++) {
        await buy(appIds[i]);
      }
    }
  }
};

const getBrokenInventories = () => { //get the current list of broken inventories
  const errormsg_list = () => log('warning', "No updated list was found, using the default list provided in the script");
  if (!useFallbackIDs) {
    jQuery.ajax({
      type: 'GET',
      url: "https://steamcommunity.com/groups/InventoryService/discussions/0/1711816348630251347/",
      success: (r) => {
        let out = [];
        r = r.substring(r.indexOf('id="forum_op_1711816348630251347"'), r.indexOf('class="forum_audit"'))
        r.replace(/<div class="bb_table_td">appID \D*\d{1,10}\D*<\/div>/gm, (a) => {
          out.push(a.substring(a.indexOf('bb_table_td>') + 3, a.indexOf('</div>')).replace(/[\D]/g, ''));
        });
        if (out.length == 0) { //use updated list or fallback when empty
          errormsg_list();
        } else {
          appIds = out;
          if (debugOnly) {
            log('good', 'Below is the list of broken inventories retrieved from the forums');
            log('', appIds);
          }
        }
        getInventory();
      },
      error: () => {
        errormsg_list()
        getInventory();
      }
    });
  } else getInventory();
}

const getInventory = () => { //remove already owned inventories
  const errormsg_inventory = () => log("bad", "Script aborted: Could not load your inventory. Please make sure you are logged in and set skipInventorySearch to true if necessary");
  if (!skipInventorySearch) {
    jQuery.ajax({
      type: 'GET',
      url: "https://steamcommunity.com/my/inventory/",
      success: (r) => {
        if (r != "") {
          try {
            if (r.includes("g_rgAppContextData") && r.includes('id="inventory_link_753"')) {
              let cache = r.slice(r.indexOf('g_rgAppContextData') + 21); //read g_rgAppContextData
              cache = JSON.parse(cache.slice(0, cache.indexOf(';')));
              if (debugOnly) {
                let [missing, notBroken] = [
                  [],
                  []
                ];
                log('good', 'Your inventory data has been stored in the variable "inventoryList". Note that listing large inventories and hurt performance');
                //log('', JSON.stringify(cache, null, 2)); // output is too large for bigger inventories
                window.inventoryList = cache;
                for (var key in cache) {
                  if (cache.hasOwnProperty.call(cache, key)) {
                    if (cache[key].load_failed) {
                      if (!appIds.includes(key)) {
                        missing.push(cache[key].name + ' (' + key + ')'); // find apps missing from the list
                      }
                    } else {
                      if (appIds.includes(key)) {
                        notBroken.push(cache[key].name + ' (' + key + ')'); // find apps wrongly listed as broken
                      }
                    }
                  }
                }
                missing.sort((a, b) => {
                  return (a > b ? 1 : (a === b ? 0 : -1));
                }) // sort alphabetically e.g. to report in the forum
                notBroken.sort((a, b) => {
                  return (a > b ? 1 : (a === b ? 0 : -1));
                })
                log('good', 'The following apps are broken but not listed in the forum');
                log('', missing);
                log('good', 'The following apps are listed as broken but do not appear to be');
                log('', notBroken);
              }
              appIds = appIds.filter(id => !cache.hasOwnProperty(id)) //filter values
              buyAll();
            } else {
              errormsg_inventory();
            }
          } catch (e) {
            log('warning', e);
            errormsg_inventory();
            return false;
          }
        } else {
          errormsg_inventory();
        }
      },
      error: () => {
        errormsg_inventory();
      }
    });
  } else buyAll();
}

const log = (extra, text) => {
  const Style = { //from simplernerd
    base: [
      "color: #8f98a0",
      "background-color: #1b2838)",
      "padding: 2px 4px",
      "border-radius: 2px"
    ],
    warning: [
      "color: rgba(30, 30, 30,1)",
      "background-color: rgba(255, 204, 0, 1)"
    ],
    bad: [
      "color: rgba(30, 30, 30,1)",
      "background-color: #a94847"
    ],
    good: [
      "color: #66C0F4",
      "background-color: #1b2838"
    ]
  };
  let style = Style.base.join(';') + ';';
  style += Style[extra] ? Style[extra].join(';') : '';
  console.log(`%c${text}`, style);
}

getBrokenInventories();