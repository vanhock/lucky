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
    case "anotherAction":
      break;
  }
});

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) return;
  if (event.data.setExtensionReady) {
    console.log("Extension ready call!");
    port.postMessage({ getReady: true });
    location.href = event.data.setExtensionReady;
  }
});

function clear() {
  console.log("Now we are going to clear this document");
  document.body.innerHTML = "";
  document.head
    .querySelectorAll("*:not(title)")
    .forEach(item => document.head.removeChild(item));
}
