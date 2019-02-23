import Vue from "vue";
import Vuex from "vuex";
import config from "./config";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    design: null,
    iframeParams: null,
    siteUrl: null,
    errors: null
  },
  getters: {
    design: state => state.design,
    iframeParams: state => state.iframeParams,
    siteUrl: state => state.siteUrl,
    siteUrlProxy: state => {
      return config.serverUrl + "/proxy/" + state.siteUrl;
    },
    viewerReady: state => {
      return state.design && state.siteUrl;
    },
    errors: state => state.errors
  },
  mutations: {
    SET_DESIGN(state, payload) {
      const design = getParentAndChild(payload.children).map(i => ({
        //name: i.name,
        //opacity: i.opacity,
        //type: i.type,
        left: i.left,
        right: i.right,
        top: i.top,
        bottom: i.bottom,
        visible: i.visible,
        width: i.width,
        height: i.height
      }));
      state.design = design;
    },
    SET_IFRAME_PARAMS(state, payload) {
      state.iframeParams = payload;
    },
    SET_SITE_URL(state, payload) {
      state.siteUrl = payload;
    },
    SET_ERRORS(state, payload) {
      state.errors = payload;
    }
  },
  actions: {
    setDesign({ commit }, payload) {
      commit("SET_DESIGN", payload);
    },
    setSiteUrl({ commit }, payload) {
      const url =
        "https://" + payload.replace("http://", "").replace("https://", "");
      return new Promise(resolve => {
        commit("SET_SITE_URL", url);
        resolve(url);
      });
    },
    setIframeParams({ commit }, payload) {
      commit("SET_IFRAME_PARAMS", payload);
    },
    setErrors({ commit }, payload) {
      commit("SET_ERRORS", payload);
    }
  }
});

function getPairsForNode(node) {
  if (node.children)
    return node.children
      .map(child => getPairsForNode(child))
      .concat(node.children)
      .reduce((arr1, arr2) => arr1.concat(arr2));
  else return [node];
}

function getParentAndChild(list) {
  return list.map(getPairsForNode).reduce((arr1, arr2) => arr1.concat(arr2));
}
