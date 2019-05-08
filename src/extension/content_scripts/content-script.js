const mountEl = document.createElement("div");
mountEl.id = "pp-app";
document.body.insertBefore(mountEl, document.body.firstChild);
import Vue from "vue";
import store from "../../services/store/store";
import App from "../Inspector";

/* eslint-disable no-new */
new Vue({
  el: "#pp-app",
  store,
  render: h => h(App)
});
