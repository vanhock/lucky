import Vue from "vue";
import Vuex from "vuex";
import AuthStoreModule from "./AuthStoreModule";
import InspectorsStoreModule from "./InspectorsStoreModule";
import ProjectsStoreModule from "./ProjectsStoreModule";
Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    appTheme: "white"
  },
  modules: {
    auth: AuthStoreModule,
    inspectors: InspectorsStoreModule,
    projects: ProjectsStoreModule
  }
});
