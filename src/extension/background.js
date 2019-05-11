import config from "../config";
import _ from "lodash";
const maxAuthRequestsCount = 3;

let currentTabId = null;
let authTabId = null;
let authRequestsCount = 0;

const init = _.debounce(function() {
  runInspectors();
}, 300);

browser.browserAction.onClicked.addListener(function(tab) {
  currentTabId = tab.id;
  checkExtensionActive(tab);
});

let lastMessage = null;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.tab.id !== currentTabId && sender.tab.id !== authTabId) {
    return;
  }
  if (
    lastMessage &&
    lastMessage.tabId === sender.tab.id &&
    lastMessage.message === request
  ) {
    return;
  }
  handleMessages(request);
  lastMessage = {
    tabId: sender.tab.id,
    message: request
  };
});

function handleMessages(request) {
  const data = request && JSON.parse(request);
  const name = Object.keys(data)[0];
  if (!data || !name) {
    return;
  }
  switch (name) {
    case "token":
      browser.storage.local.set({ "pp-u-t-s": data.token });
      if (authTabId) {
        browser.tabs.remove(authTabId);
        browser.tabs.update(currentTabId, { active: true });
        authTabId = null;
        browser.tabs.sendMessage(
          currentTabId,
          JSON.stringify({ initInspectors: data.token })
        );
      }
      break;
    case "resetToken":
      browser.storage.local.remove("pp-u-t-s");
      return runAuthScript();
    case "isActive":
      toggleActive(currentTabId);
      if (!data.isActive) {
        init();
      } else {
        authRequestsCount = 0;
        browser.tabs.sendMessage(
          currentTabId,
          JSON.stringify({ reloadPage: true })
        );
      }
      break;
    case "inspectorReady":
      getToken();
  }
}

function getToken() {
  browser.storage.local.get("pp-u-t-s").then(response => {
    const token = response["pp-u-t-s"];
    if (token) {
      console.log("Try to send inspector init...");
      browser.tabs.sendMessage(
        currentTabId,
        JSON.stringify({ initInspectors: token })
      );
      console.log("Inspector init sent!");
    } else {
      console.log("Token not found. Running auth script...");
      runAuthScript();
    }
  });
}

function runAuthScript() {
  if (authRequestsCount >= maxAuthRequestsCount) {
    return;
  }
  browser.tabs
    .create({ url: config.apiUrl + config.authUrl })
    .then(tab => {
      browser.tabs.executeScript(tab.id, {
        file: "content_scripts/auth-script.js"
      });
      authTabId = tab.id;
      authRequestsCount++;
    })
    .catch(error => console.log(error));
}

function runInspectors() {
  browser.tabs.executeScript(currentTabId, {
    file: "content_scripts/inspectors-view.js"
  });
}

function checkExtensionActive(tab) {
  console.log("Sent active check request to tab " + tab.id);
  browser.tabs.sendMessage(tab.id, "checkActive");
}

function toggleActive() {
  browser.tabs.sendMessage(currentTabId, "toggleActive");
}
