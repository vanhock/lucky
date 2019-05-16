import Vue from "vue";
import store from "../../services/store/store";
import App from "../Inspectors";
import i18n from "../../i18n";
console.log(`Inspector opened for ${location.href}`);
const port = browser.runtime.connect({ name: "inspectors" });
port.postMessage({ message: "Inspectors connected" });
port.onMessage.addListener(message => {
  switch (Object.keys(message)[0]) {
    case "initInspectors":
      console.log(`Inspectors initialized on ${location.href}`);
      break;
    case "reloadPage":
      location.reload();
  }
  if (message === "run") {
    document.body.innerHTML = "";
    const mountEl = document.createElement("div");
    mountEl.id = "pp-inspectors-app";
    document.body.insertBefore(mountEl, document.body.firstChild);
    console.log("Inspectors run!");

    /* eslint-disable no-new */
    new Vue({
      el: "#pp-inspectors-app",
      store,
      i18n,
      render: h => h(App)
    });
  }
});

window.addEventListener("message", function(event) {
  if (event.source !== window) return;
  if (event.data === "logOut") {
    port.sendMessage({ resetToken: true });
  }
});
