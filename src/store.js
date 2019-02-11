import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    designMarkup: {}
  },
  getters: {
    designMarkup: state => {
      return state.designMarkup;
    }
  },
  mutations: {
    SET_DESIGN_MARKUP(state, payload) {
      state.designMarkup = payload;
    }
  },
  actions: {
    setDesignMarkup({ commit }, payload) {
      commit("SET_DESIGN_MARKUP", payload);
    }
  }
});
