import config from "../config";
import _ from "lodash";
const maxAuthRequestsCount = 3;

let currentTabId = null;
let authTabId = null;
let appActive = false;
let authRequestsCount = 0;

const init = _.debounce(function(tab) {
  if (appActive) {
    appActive = false;
    authRequestsCount = 0;
    return browser.tabs.sendMessage(
      tab.id,
      JSON.stringify({ reloadPage: true })
    );
  }
  getToken();
  currentTabId = tab.id;
}, 300);

browser.browserAction.onClicked.addListener(function(tab) {
  init(tab);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessages(request);
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
        browser.tabs.sendMessage(
          currentTabId,
          JSON.stringify({ "pp-u-t-s": data.token })
        );
        authTabId = null;
      }
      return runInspectors();
    case "resetToken":
      browser.storage.local.remove("pp-u-t-s");
      runAuthScript();
  }
}

function getToken(cb) {
  browser.storage.local.get("pp-u-t-s").then(token => {
    if (token) {
      return runInspectors();
    }
    if (!token["pp-u-t-s"]) {
      runAuthScript();
    } else {
      cb(null, token["pp-u-t-s"]);
    }
  });
}

function runAuthScript() {
  if (authRequestsCount >= maxAuthRequestsCount) {
    return;
  }
  browser.tabs
    .create({ url: config.apiUrl })
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
  if (!currentTabId) {
    return;
  }
  browser.tabs.executeScript(currentTabId, {
    file: "content_scripts/inspectors-view.js"
  });
  appActive = true;
}
