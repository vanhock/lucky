import { EXTENSION_SET_PORT } from "./mutation-types";

export default {
  state: {
    port: {}
  },
  getters: {
    port: state => state.port
  },
  mutations: {
    [EXTENSION_SET_PORT]: (state, payload) => {
      state.port = payload;
    }
  },
  actions: {
    [EXTENSION_SET_PORT]: ({ commit }, payload) => {
      console.log("Setting Port to store..");
      commit(EXTENSION_SET_PORT, payload);
    }
  }
};
