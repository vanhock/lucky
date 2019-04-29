import Vue from "vue";
import Vuex from "vuex";
import AuthStoreModule from "./AuthStoreModule";
import InspectorsStoreModule from "./InspectorsStoreModule";
Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    appTheme: "white"
  },
  modules: {
    auth: AuthStoreModule,
    inspectors: InspectorsStoreModule
  }
});
