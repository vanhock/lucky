import config from "../config";
import _ from "lodash";
const ports = {};

browser.tabs.onActivated.addListener(({ tabId }) => {
  /** Reset icon if tab changed **/
  browser.tabs
    .get(tabId)
    .then(tab => {
      if (tab.status === "complete" && tab.url) {
        setIcon();
      }
      if (!tab.url) {
        setIcon("loading");
      }
    })
    .catch(error => {
      console.log(`Error: ${error}`);
    });
});
browser.tabs.onUpdated.addListener((tabId, { status }) => {
  if (status === "loading") {
    setIcon("loading");
  }
  if (status === "complete") {
    setIcon();
  }
});

browser.runtime.onConnect.addListener(connected);
browser.browserAction.onClicked.addListener(
  _.debounce(function(tab) {
    if (!ports[tab.id]) {
      return;
    }
    if (!ports[tab.id].inspectorsActive) {
      ports[tab.id].postMessage({ initInspectors: true });
      ports[tab.id].inspectorsActive = true;
    } else {
      ports[tab.id].inspectorsActive = false;
      ports[tab.id].postMessage({ reloadPage: true });
    }
  }, 300)
);

function connected(p) {
  p.onMessage.addListener(handleMessages);
  p.initInspectors = false;
  ports[p.sender.tab.id] = p;
  isCurrentTab(p.sender.tab.id, result => {
    if (result) {
      setIcon();
    }
  });
}

function handleMessages(data, { sender }) {
  const name = Object.keys(data)[0];
  if (!data || !name) {
    return;
  }
  switch (name) {
    case "message":
      console.log(`Message: ${data.message}`);
      break;
    case "token":
      browser.storage.local.set({ "pp-u-t-s": data.token });
      browser.tabs.remove(tab);
      browser.tabs.update(sender.tab.id, { active: true });
      setSessionState(tab.id, "authTabId", null);
      browser.tabs.sendMessage(
        sender.tab.id,
        JSON.stringify({ initInspectors: data.token })
      );
      break;
    case "resetToken":
      browser.storage.local.remove("pp-u-t-s");
      return runAuthScript();
    case "closeExtension":
      return closeExtension(sender.tab.id);
    case "inspectorReady":
      return getToken(sender.tab.id);
  }
}

function beforeClosePort(tab) {
  ports[tab.id].inspectorsActive = false;
}

function setIcon(folder) {
  const paths = {};
  config.iconSizes.forEach(size => {
    paths[size] = `icons${(folder && "/" + folder) || ""}/${size}.png`;
  });
  browser.browserAction.setIcon({
    path: paths
  });
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
      runAuthScript(tabId);
    }
  });
}

function runAuthScript(tabId) {
  browser.tabs
    .create({ url: config.apiUrl + config.authUrl })
    .then(tab => {
      setSessionState(tabId, "authTabId", tab.id);
      browser.tabs.executeScript(tab.id, {
        file: "content_scripts/auth-script.js"
      });
    })
    .catch(error => console.log(error));
}

function runInspectors(tabId) {
  browser.tabs.executeScript(tabId, {
    file: "content_scripts/inspectors-view.js"
  });
}

function closeExtension(tabId) {
  browser.tabs.sendMessage(tabId, JSON.stringify({ reloadPage: true }));
  removeSessionState(tabId);
  browser.tabs.onUpdated.removeListener(closeExtension);
}

function getSessionState(tabId) {
  return new Promise(resolve => {
    browser.storage.local
      .get(tabId.toString())
      .then(success => {
        resolve((Object.keys(success).length && success[tabId]) || null);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

function setSessionState(tabId, key, value) {
  getSessionState(tabId)
    .then(data => {
      browser.storage.local.set({ [tabId]: { ...data, [key]: value } });
    })
    .catch(() => {
      browser.storage.local.set({ [tabId]: { [key]: value } });
    });
}

function removeSessionState(tabId) {
  browser.storage.local.remove(tabId.toString());
}

function isCurrentTab(tabId, cb) {
  if (!tabId) {
    return;
  }
  return browser.tabs.getCurrent().then(tab => {
    cb(tab.id === tabId);
  });
}
