const mountEl = document.createElement("div");
mountEl.id = "pp-inspectors-app";
document.body.innerHTML = "";
document.body.insertBefore(mountEl, document.body.firstChild);

console.log("Inspectors run!");

browser.runtime.onMessage.addListener(request => {
  const data = request && JSON.parse(request);
  if (!data) {
    return;
  }
  const name = Object.keys(data)[0];
  switch (name) {
    case "reloadPage":
      location.reload();
  }
});

import Vue from "vue";
import store from "../../services/store/store";
import App from "../Inspectors";

/* eslint-disable no-new */
new Vue({
  el: "#pp-inspectors-app",
  store,
  render: h => h(App)
});
