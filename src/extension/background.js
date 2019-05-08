import config from "../config";
let currentTabId = null;
let authTabId = null;
browser.browserAction.onClicked.addListener(function(tab) {
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

browser.runtime.onMessage.addListener(response => {
  const data = response && JSON.parse(response);
  if (!data) {
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
  }
});

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
    file: "content_scripts/content-script.js"
  });
}
