import Vue from "vue";
import store from "../../services/store/store";
import App from "../Inspectors";
import i18n from "../../i18n";

if (!window.ppLoaded) {
  init();
  window.ppLoaded = true;
}

function init() {
  window.hasRun = true;
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

window.addEventListener("message", function(event) {
  if (event.source !== window) return;
  if (event.data === "logOut") {
    browser.runtime.sendMessage(JSON.stringify({ resetToken: true }));
  }
});
