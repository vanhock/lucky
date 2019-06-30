import Vue from "vue";
import store from "../../services/store/store";
import App from "../../views/InspectorsView";
import i18n from "../../i18n";
import { EXTENSION_SET_PORT } from "../../services/store/mutation-types";

const port = browser.runtime.connect({ name: "content-script" });
if (!port.scriptsLoaded) {
  const mountEl = document.createElement("div");
  mountEl.id = "pp-inspectors-app";
  document.body.insertBefore(mountEl, document.body.firstChild);

  port.postMessage({
    message: `Content script connected for ${location.href}`
  });
  port.scriptsLoaded = true;
}

/** Connection with background.js **/
port.onMessage.addListener(response => {
  switch (Object.keys(response)[0]) {
    case "initVue":
      initVue();
      break;
    case "reloadPage":
      location.reload();
  }
});

function initVue() {
  console.log(`Inspectors initialized on ${location.href}`);
  /* eslint-disable no-new */
  new Vue({
    el: "#pp-inspectors-app",
    store,
    i18n,
    created() {
      this.$store.dispatch(EXTENSION_SET_PORT, port);
    },
    render: h => h(App)
  });
}
