import Vue from "vue";
import Vuex from "vuex";
import config from "./config";
import { getParentAndChild } from "./atoms/utils";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    design: null,
    currentFrame: null,
    currentProject: null,
    /**
     * name: String,
     * id: String,
     * date: Date,
     * frameParams: Object,
     * foundNodes: Object,
     * designBlocks: Array,
     * designImage: String
     **/
    recentProjects: null
  },
  getters: {
    design: state => state.design,
    currentFrame: state => state.currentFrame,
    currentFrameWindow: state => {
      if (!state.currentFrame) {
        return window;
      }
      return state.currentFrame.contentWindow;
    },
    currentFrameDocument: (state, getters) => {
      if (!state.currentFrame) {
        return window.document;
      }
      return getters.currentFrameWindow.document;
    },
    currentFrameBody: (state, getters) => {
      if (!state.currentFrame) {
        return window.document.body;
      }
      return getters.currentFrameDocument.body;
    },
    frameParams: state =>
      state.currentProject &&
      state.currentProject.hasOwnProperty("frameParams") &&
      state.currentProject.frameParams,
    siteUrl: (state, getters) => {
      if (
        !getters.frameParams ||
        !getters.frameParams.hasOwnProperty("siteUrl")
      ) {
        return;
      }
      return getters.frameParams.siteUrl;
    },
    siteUrlProxy: (state, getters) => {
      if (!getters.siteUrl) {
        return;
      }
      return config.serverUrl + "/proxy/" + getters.siteUrl;
    },
    viewerReady: (state, getters) => {
      return (
        (state.design &&
          getters.frameParams &&
          getters.frameParams.hasOwnProperty("siteUrl")) ||
        getters.foundNodes
      );
    },
    foundNodes: state =>
      state.currentProject &&
      state.currentProject.hasOwnProperty("foundNodes") &&
      state.currentProject.foundNodes,
    isFoundNodes: (state, getters) => {
      return getters.foundNodes && Object.entries(getters.foundNodes).length;
    }
  },
  mutations: {
    SET_DESIGN(state, payload) {
      if (!payload || !payload.hasOwnProperty("children")) {
        return;
      }
      state.design = getParentAndChild(payload.children)
        .filter(f => f.type === "layer")
        .map(i => ({
          name: i.name,
          opacity: i.opacity,
          left: i.left,
          right: i.right,
          top: i.top,
          bottom: i.bottom,
          visible: i.visible,
          width: i.width,
          height: i.height,
          text: (i.text && true) || false
        }));
    },
    SET_FRAME_PARAMS(state, payload) {
      if (!payload || typeof payload !== "object") {
        return;
      }

      for (let key in payload) {
        if (!payload.hasOwnProperty(key)) {
          continue;
        }
        if (!state.currentProject) {
          state.currentProject = {
            frameParams: {},
            foundNodes: {}
          };
        }

        if (state.currentProject.frameParams.hasOwnProperty(key)) {
          state.currentProject.frameParams[key] = payload[key];
        } else {
          Vue.set(state.currentProject.frameParams, key, payload[key]);
        }
      }
    },
    SET_PROJECT_INFO(state, payload) {
      payload.id ? (state.currentProject.id = payload.id) : "";
      payload.name ? (state.currentProject.name = payload.name) : "";
      state.currentProject.date = Date.now();
    },
    SET_FOUND_NODES(state, payload) {
      if (!state.currentProject) {
        state.currentProject = {};
      }
      state.currentProject.foundNodes = payload;
    },
    SET_CURRENT_PROJECT(state, payload) {
      state.currentProject = payload;
    },
    SET_CURRENT_FRAME(state, payload) {
      state.currentFrame = payload;
    },
    RESET_HOMEPAGE_STATE(state) {
      state.design = null;
      state.currentProject = null;
      state.currentFrame = null;
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
        commit("SET_FRAME_PARAMS", { siteUrl: url });
        resolve(url);
      });
    },
    setFrameParams({ commit }, payload) {
      commit("SET_FRAME_PARAMS", payload);
    },
    setFoundNodes({ commit, state }, payload) {
      return new Promise(resolve => {
        commit("SET_FOUND_NODES", payload);
        resolve(state.currentProject);
      });
    },
    setProjectInfo({ commit }, payload) {
      commit("SET_PROJECT_INFO", payload);
    },
    setCurrentProject({ commit }, payload) {
      commit("SET_CURRENT_PROJECT", payload);
    },
    setCurrentFrame({ commit }, payload) {
      commit("SET_CURRENT_FRAME", payload);
    },
    resetHomepageState({ commit }) {
      commit("RESET_HOMEPAGE_STATE");
    }
  }
});
