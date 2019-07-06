import config from "../config";
import _ from "lodash";
const ports = {};

browser.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (message === "version") {
      sendResponse({
        type: "success",
        version: "0.1.0"
      });
      return true;
    }
  }
);

browser.browserAction.onClicked.addListener(
  _.debounce(function(tab) {
    if (ports[tab.id] && ports[tab.id].inspectorsActive) {
      ports[tab.id].inspectorsActive = false;
      try {
        ports[tab.id].postMessage({ reloadPage: true });
        delete ports[tab.id];
      } catch {
        console.log(`Failed to connect with tab: ${tab.id}`);
      }
    } else {
      setUpInspectorsScript(tab.id);
    }
  }, 300)
);

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

browser.tabs.onUpdated.addListener((tabId, { status }, { url }) => {
  if (status === "loading") {
    setIcon("loading");
  }
  if (status === "complete" && url) {
    setIcon();
  }
});

browser.runtime.onConnect.addListener(connected);
browser.runtime.onSuspend.addListener(disconnected);

function connected(p) {
  if (ports[p.sender.tab.id] && ports[p.sender.tab.id].name === "auth") {
    return;
  }
  p.onMessage.addListener(handleMessages);
  ports[p.sender.tab.id] = p;
  switch (p.name) {
    case "main-script":
      isCurrentTab(p.sender.tab.id, result => {
        if (result) {
          setIcon();
          ports[p.sender.tab.id].connected = true;
        }
      });
      break;
    case "content-script":
      p.initInspectors = false;
      isCurrentTab(p.sender.tab.id, result => {
        if (result) {
          initInspectors(p.sender.tab.id);
        }
      });
      break;
    case "auth":
      for (let key in ports) {
        if (
          ports.hasOwnProperty(key) &&
          ports[key].authTabId === p.sender.tab.id
        ) {
          ports[p.sender.tab.id].postMessage({ getToken: true });
          return (ports[p.sender.tab.id].inspectorTabId = parseInt(key));
        }
      }
      break;
  }
}

function disconnected(p) {
  switch (p.name) {
    case "content-script":
      // eslint-disable-next-line no-case-declarations
      const authTabId = ports[p.sender.tab.id].authTabId;
      if (authTabId && ports[authTabId]) {
        delete ports[authTabId].inspectorTabId;
      }
      break;
    case "auth":
      // eslint-disable-next-line no-case-declarations
      const inspectorTabId = ports[p.sender.tab.id].inspectorTabId;
      if (inspectorTabId && ports[inspectorTabId]) {
        delete ports[inspectorTabId].authTabId;
      }
      break;
  }
  delete ports[p.sender.tab.id];
}

function setUpInspectorsScript(tabId) {
  ports[tabId].postMessage({ clear: true });
  browser.tabs.executeScript(tabId, {
    file: "content_scripts/inspectors-script.js"
  });
}

function initInspectors(tabId) {
  if (!ports[tabId].inspectorsActive) {
    ports[tabId].postMessage({ initVue: true });
  }
  checkTokenBeforeStart(tabId, token => {
    ports[tabId].postMessage({ initInspectors: token });
    ports[tabId].inspectorsActive = true;
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
      // eslint-disable-next-line no-case-declarations
      const inspectorTabId = ports[sender.tab.id].inspectorTabId;
      browser.storage.local.set({ "pp-u-t-s": data.token });
      browser.tabs.remove(sender.tab.id);
      browser.tabs.update(inspectorTabId, {
        active: true
      });
      ports[inspectorTabId].postMessage({ initInspectors: data.token });
      ports[inspectorTabId].inspectorsActive = true;
      ports[inspectorTabId].authorization = false;
      break;
    case "resetToken":
      browser.storage.local.remove("pp-u-t-s");
      return runAuthScript(sender.tab.id);
    case "closeExtension":
      return closeExtension(sender.tab.id);
    case "takeScreenShot":
      browser.tabs.captureVisibleTab().then(imagePath => {
        ports[sender.tab.id].postMessage({ screenShot: imagePath });
      });
  }
}

function checkTokenBeforeStart(tabId, cb) {
  browser.storage.local.get("pp-u-t-s").then(response => {
    const token = response["pp-u-t-s"];
    if (token) {
      cb(token);
    } else {
      console.log("Token not found. Running auth script...");
      runAuthScript(tabId);
    }
  });
}

function runAuthScript(tabId = null) {
  if (!ports[tabId].authorization) {
    ports[tabId].authorization = true;
    browser.tabs
      .create({ url: config.apiUrl + config.authUrl })
      .then(tab => {
        browser.tabs.executeScript(tab.id, {
          file: "content_scripts/auth-script.js"
        });
        ports[tabId].authTabId = tab.id;
      })
      .catch(error => console.log(error));
  }
}

function closeExtension(tabId) {
  ports[tabId].postMessage({ reloadPage: true });
  browser.tabs.onUpdated.removeListener(closeExtension);
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

function isCurrentTab(tabId, cb) {
  if (!tabId) {
    return;
  }
  browser.tabs.get(tabId).then(tab => {
    return cb(tab.active);
  });
}
