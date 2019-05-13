import config from "../config";
import _ from "lodash";
const maxAuthRequestsCount = 3;

let authTabId = null;
let authRequestsCount = 0;

const init = _.debounce(function() {
  runInspectors();
}, 300);

browser.browserAction.onClicked.addListener(function(tab) {
  checkExtensionActive(tab);
});

let lastMessage = null;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id !== config.extensionId) {
    return;
  }
  /*if (
    lastMessage &&
    lastMessage.tabId === sender.tab.id &&
    lastMessage.message === request
  ) {
    return;
  }*/
  lastMessage = {
    tabId: sender.tab.id,
    message: request
  };
  handleMessages(request, sender);
});

function handleMessages(request, sender) {
  const data = request && JSON.parse(request);
  const name = Object.keys(data)[0];
  if (!data || !name) {
    return;
  }
  switch (name) {
    case "token":
      browser.storage.local.set({ "pp-u-t-s": data.token });
      if (authTabId && authRequestsCount < maxAuthRequestsCount) {
        browser.tabs.remove(authTabId);
        browser.tabs.update(sender.tab.id, { active: true });
        authTabId = null;
        browser.tabs.sendMessage(
          sender.tab.id,
          JSON.stringify({ initInspectors: data.token })
        );
      }
      authRequestsCount++;
      break;
    case "resetToken":
      browser.storage.local.remove("pp-u-t-s");
      return runAuthScript();
    case "isActive":
      if (!data.isActive) {
        init();
      } else {
        closeExtension(sender.tab.id);
      }
      break;
    case "closeExtension":
      return closeExtension(sender.tab.id);
    case "inspectorReady":
      return getToken(sender.tab.id);
  }
}

function getToken(tabId) {
  browser.storage.local.get("pp-u-t-s").then(response => {
    const token = response["pp-u-t-s"];
    if (token) {
      console.log("Try to send inspector init...");
      browser.tabs.sendMessage(
        tabId,
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

function runInspectors(tabId) {
  browser.tabs.executeScript(tabId, {
    file: "content_scripts/inspectors-view.js"
  });
}

function checkExtensionActive(tab) {
  console.log("Sent active check request to tab " + tab.id);
  browser.tabs.sendMessage(tab.id, JSON.stringify({ checkActive: true }));
}

function closeExtension(tabId) {
  authRequestsCount = 0;
  browser.tabs.sendMessage(tabId, JSON.stringify({ reloadPage: true }));
}
