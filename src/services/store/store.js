import Vue from "vue";
import Vuex from "vuex";
import AuthStoreModule from "./AuthStoreModule";
import InspectorsStoreModule from "./InspectorsStoreModule";
import ProjectsStoreModule from "./ProjectsStoreModule";
import TrashStoreModule from "./TrashStoreModule";
import PagesStoreModule from "./PagesStoreModule";
import ExtensionStoreModule from "./ExtensionStoreModule";
import TasksStoreModule from "./TasksStoreModule";
Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    appTheme: "white",
    inspector: false
  },
  getters: {
    inspector: state => state.inspector
  },
  modules: {
    extension: ExtensionStoreModule,
    auth: AuthStoreModule,
    inspectors: InspectorsStoreModule,
    projects: ProjectsStoreModule,
    pages: PagesStoreModule,
    tasks: TasksStoreModule,
    trash: TrashStoreModule
  },
  mutations: {
    startInspector(state) {
      state.inspector = true;
    }
  },
  actions: {
    startInspector({ commit }, cb) {
      commit("startInspector", cb);
    }
  }
});
