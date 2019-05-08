import store from "../store";

browser.browserAction.onClicked.addListener(function(tab) {
  browser.storage.local.get("user-token").then(success => {
    alert("User token: " + success["user-token"]);
  });
});

browser.runtime.onMessage.addListener(function(message, callback) {
  if (message === "runContentScript") {
    browser.tabs.executeScript({
      file: "content_scripts/content-script.js"
    });
  }
});
