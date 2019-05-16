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
      checkTokenBeforeStart(tab.id, () => {
        ports[tab.id].postMessage({ initInspectors: true });
        ports[tab.id].inspectorsActive = true;
      });
    } else {
      ports[tab.id].inspectorsActive = false;
      ports[tab.id].postMessage({ reloadPage: true });
    }
  }, 300)
);

function connected(p) {
  p.onMessage.addListener(handleMessages);
  ports[p.sender.tab.id] = p;
  switch (p.name) {
    case "inspectors":
      p.initInspectors = false;
      isCurrentTab(p.sender.tab.id, result => {
        if (result) {
          setIcon();
        }
      });
      break;
    case "auth":
      for (let key in ports) {
        if (
          ports.hasOwnProperty(key) &&
          ports[key].authTabId === p.sender.tab.id
        ) {
          return (ports[p.sender.tab.id].inspectorTabId = key);
        }
      }
      break;
  }
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
      ports[inspectorTabId].postMessage({ initInspectors: true });
      ports[inspectorTabId].inspectorsActive = true;
      break;
    case "resetToken":
      browser.storage.local.remove("pp-u-t-s");
      return runAuthScript();
    case "closeExtension":
      return closeExtension(sender.tab.id);
  }
}

function checkTokenBeforeStart(tabId, cb) {
  browser.storage.local.get("pp-u-t-s").then(response => {
    const token = response["pp-u-t-s"];
    if (token) {
      cb();
    } else {
      console.log("Token not found. Running auth script...");
      runAuthScript(tabId);
    }
  });
}

function runAuthScript(tabId) {
  /* ToDo: Write check for auth tab connection exist and active */
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
