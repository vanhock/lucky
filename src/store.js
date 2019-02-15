import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    designMarkup: {},
    siteUrl: null
  },
  getters: {
    designMarkup: state => {
      return getParentAndChild(state.designMarkup.children);
    },
    siteUrl: state => state.siteUrl
  },
  mutations: {
    SET_DESIGN_MARKUP(state, payload) {
      state.designMarkup = payload;
    },
    SET_SITE_URL(state, payload) {
      state.siteUrl = payload;
    },
  },
  actions: {
    setDesignMarkup({ commit }, payload) {
      commit("SET_DESIGN_MARKUP", payload);
    },
    setSiteUrl({ commit }, payload) {
      commit("SET_SITE_URL", payload);
    }
  }
});

function getPairsForNode(node) {
  if (node.children)
    return node.children
      .map(child => getPairsForNode(child))
      .concat(node.children)
      .reduce((arr1, arr2) => arr1.concat(arr2));
  else return [];
}

function getParentAndChild(list) {
  return list.map(getPairsForNode).reduce((arr1, arr2) => arr1.concat(arr2));
}
