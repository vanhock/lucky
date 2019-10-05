import config from "../../config";
console.log("This is a main script");
/** This need for extension exist check **/
const extensionId = document.createElement("div");
extensionId.setAttribute("extension-id", config.extensionId);
document.body.prepend(extensionId);

const port = browser.runtime.connect({ name: "main-script" });
port.onMessage.addListener(response => {
  switch (Object.keys(response)[0]) {
    case "clear":
      clear();
      document.addEventListener("DOMContentLoaded", clear);
      break;
    case "extensionInstalled":
      window.postMessage({ extensionInstalled: true }, location.href);
      break;
  }
});

window.addEventListener("message", event => {
  // We only accept messages from ourselves
  if (event.source !== window) return;
  if (event.data.redirectToInspection) {
    const inspector = event.data.redirectToInspection;
    console.log("Extension ready call!");
    port.postMessage({
      openExtension: { params: inspector.params }
    }); /** Activate extension before page loaded **/
    location.href = inspector.url;
  }
  if (event.data.checkExtension) {
    try {
      port.postMessage({ checkExtension: true });
    } catch (e) {
      window.postMessage({ extensionInstalled: false }, location.href);
    }
  }
});

function clear() {
  console.log("Now we are going to clear this document");
  document.body.innerHTML = "";
  document.head
    .querySelectorAll("*:not(title)")
    .forEach(item => document.head.removeChild(item));
}
