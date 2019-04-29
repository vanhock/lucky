import {
  PROJECT_SET_CURRENT_PROJECT,
  PROJECT_SET_PROJECT_INFO
} from "./mutation-types";

export default {
  state: {
    currentProject: {},
    projects: [],
    status: ""
  },
  getters: {},
  mutations: {
    [PROJECT_SET_PROJECT_INFO](state, payload) {
      payload.id ? (state.currentProject.id = payload.id) : "";
      payload.name ? (state.currentProject.name = payload.name) : "";
      state.currentProject.date = Date.now();
    },
    [PROJECT_SET_CURRENT_PROJECT](state, payload) {
      state.currentProject = payload;
    }
  },
  actions: {
    [PROJECT_SET_PROJECT_INFO]: ({ commit }, payload) => {
      commit("PROJECT_SET_PROJECT_INFO", payload);
    },
    [PROJECT_SET_CURRENT_PROJECT]: ({ commit }, payload) => {
      commit("PROJECT_SET_CURRENT_PROJECT", payload);
    }
  }
};
