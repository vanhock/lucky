document.body.innerHTML = "";
const mountEl = document.createElement("div");
mountEl.id = "pp-inspectors-app";
document.body.insertBefore(mountEl, document.body.firstChild);
console.log("Inspectors run!");

import Vue from "vue";
import store from "../../services/store/store";
import App from "../Inspectors";
import i18n from "../../i18n";
/* eslint-disable no-new */
new Vue({
  el: "#pp-inspectors-app",
  store,
  i18n,
  render: h => h(App)
});

browser.runtime.onMessage.addListener(request => {
  const data = request && JSON.parse(request);
  if (!data) {
    return;
  }
  const name = Object.keys(data)[0];
  switch (name) {
    case "reloadPage":
      return location.reload();
  }
});
