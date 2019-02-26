import Vue from "vue";
import Vuex from "vuex";
import config from "./config";
import { getParentAndChild } from "./atoms/utils";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    design: null,
    iframeParams: null,
    siteUrl: null,
    foundNodes: null,
    currentProject: null
  },
  getters: {
    design: state => state.design,
    iframeParams: state => state.iframeParams,
    siteUrl: state => {
      if (
        !state.iframeParams ||
        !state.iframeParams.hasOwnProperty("siteUrl")
      ) {
        return;
      }
      return state.iframeParams.siteUrl;
    },
    siteUrlProxy: state => {
      if (
        !state.iframeParams ||
        !state.iframeParams.hasOwnProperty("siteUrl")
      ) {
        return;
      }
      return config.serverUrl + "/proxy/" + state.iframeParams.siteUrl;
    },
    viewerReady: state => {
      return (
        state.design &&
        state.iframeParams &&
        state.iframeParams.hasOwnProperty("siteUrl") &&
        state.iframeParams.siteUrl
      );
    },
    foundNodes: state => state.foundNodes,
    isFoundNodes: state => {
      return (
        state.foundNodes &&
        Array.isArray(state.foundNodes) &&
        state.foundNodes.length
      );
    }
  },
  mutations: {
    SET_DESIGN(state, payload) {
      if (!payload || !payload.hasOwnProperty("children")) {
        return;
      }
      state.design = getParentAndChild(payload.children).map(i => ({
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
    },
    SET_IFRAME_PARAMS(state, payload) {
      if (!payload || typeof payload !== "object") {
        return;
      }

      for (let key in payload) {
        if (!payload.hasOwnProperty(key)) {
          continue;
        }
        if (state.iframeParams && state.iframeParams.hasOwnProperty(key)) {
          state.iframeParams[key] = payload[key];
        } else {
          if (!state.iframeParams) state.iframeParams = {};
          Vue.set(state.iframeParams, key, payload[key]);
        }
      }
    },
    SET_FOUND_NODES(state, payload) {
      state.foundNodes = payload;
    },
    SET_CURRENT_PROJECT(state, payload) {
      state.currentProject = payload
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
        commit("SET_IFRAME_PARAMS", { siteUrl: url });
        resolve(url);
      });
    },
    setIframeParams({ commit }, payload) {
      commit("SET_IFRAME_PARAMS", payload);
    },
    setFoundNodes({ commit }, payload) {
      commit("SET_FOUND_NODES", payload);
    },
    setCurrentProject({commit}, payload) {
      commit("SET_CURRENT_PROJECT", payload);
    }
  }
});
