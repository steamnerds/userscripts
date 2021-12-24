// ==UserScript==
// @name         Toggle single person view in Steam's activity feed
// @icon         https://store.steampowered.com/favicon.ico
// @namespace    SteamNerds
// @version      1.0
// @description  Enables showing only a single person's activity
// @author       uniQ
// @include      /^https:\/\/steamcommunity\.com\/(id\/[\w-_]{1,64}|profiles\/\d{17})\/home/
// @updateURL    https://raw.githubusercontent.com/steamnerds/userscripts/master/ActivityFeedDisplaySingleFriend.user.js
// @grant        none
// ==/UserScript==
// https://github.com/steamnerds/userscripts
/*jshint esversion: 6 */
/*
This code has several known issues such as not working on dynamically loaded activity pages.
Since only a few people requested this functionality, it isn't a high priority

*/

function displayActivityFeatures() {
  $J('.blotter_author_block').append($J("<div>", {
    "text": "",
    "style": "margin-top: 10px; display: block;"
  }).append($J("<a>", {
    "text": "Only show this friend",
    "style": "",
    "onClick": "toggleUser($J(this))"
  })));
}

function toggleUser(reference) {
  var userid = reference.parent().parent().find('img[data-miniprofile]').attr('data-miniprofile');
  $J('.blotter_block').each((index) => {
    if ($J('.blotter_block').eq(index).find('img[data-miniprofile]').attr('data-miniprofile') != userid) { //check userid, $J(this) doesn't work
      $J('.blotter_block').eq(index).toggle();
    }
  });
}

function initialize() {
  var url = window.location.href;
  switch (true) {
    case /^https:\/\/steamcommunity\.com\/(id\/[\w-_]{1,64}|profiles\/\d{17})\/home/.test(url): // activity page
      displayActivityFeatures();
      break;
    default:
      console.log("Inventory Tabs Check: The script was executed on an invalid page and thus terminated > Only run on " +
        "https://steamcommunity.com/sharedfiles/filedetails/?id=873140323 or an inventory page");
  }
}

(() => {
  var script = document.createElement('script');
  script.innerHTML = "" +
    displayActivityFeatures.toString() +
    toggleUser.toString() +
    initialize.toString() + "(() => initialize())()";
  document.body.appendChild(script);
})();
