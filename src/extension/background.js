import config from "../config";
let currentTabId = null;
let authTabId = null;
let appActive = false;
browser.browserAction.onClicked.addListener(function(tab) {
  if (appActive) {
    appActive = false;
    return browser.tabs.sendMessage(
      tab.id,
      JSON.stringify({ reloadPage: true })
    );
  }
  getToken((error, token) => {
    if (token) {
      return runInspectors();
    }
    browser.tabs
      .create({ url: config.apiUrl })
      .then(tab => {
        browser.tabs.executeScript(tab.id, {
          file: "content_scripts/auth-script.js"
        });
        authTabId = tab.id;
      })
      .catch(error => console.log(error));
  });
  currentTabId = tab.id;
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessages(request);
});

function handleMessages(request) {
  const data = request && JSON.parse(request);
  if (!data || !data.token) {
    return;
  }
  const name = Object.keys(data)[0];
  switch (name) {
    case "token":
      browser.storage.local.set({ "user-token": data.token });
      if (authTabId) {
        browser.tabs.remove(authTabId);
        browser.tabs.update(currentTabId, { active: true });
      }
      runInspectors();
  }
}

function getToken(cb) {
  browser.storage.local.get("user-token").then(token => {
    if (!token["user-token"]) {
      cb("No token");
    } else {
      cb(null, token["user-token"]);
    }
  });
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
