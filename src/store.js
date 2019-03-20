import Vue from "vue";
import Vuex from "vuex";
import config from "./config";
import { getParentAndChild } from "./atoms/utils";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentFrame: null,
    currentProject: null,
    /**
     * name: String,
     * id: String,
     * date: Date,
     * frameParams: Object,
     * foundNodes: Object,
     * designBlocks: Array,
     * designImage: String,
     * designParams: Object
     * viewParams: {
     *   websiteInspector: true,
     *   designInspector: true,
     *   websiteInspectorHeight: '',
     *   showAllDesignBlocks: false,
     *   showFoundDesignBlocks: true
     * }
     *
     **/
    recentProjects: null,
    targetElement: null
  },
  getters: {
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
    frameParams: state => getObjectValue(state.currentProject, "frameParams"),
    designBlocks: state => {
      const foundNodes = getObjectValue(state.currentProject, "foundNodes");
      const designBlocks = getObjectValue(state.currentProject, "designBlocks");
      if (!foundNodes) {
        return designBlocks;
      }
      for (let i in foundNodes) {
        if (!foundNodes.hasOwnProperty(i)) {
          continue;
        }
        const designIndex = foundNodes[i].designBlockIndex;
        if (designBlocks[designIndex]) {
          Vue.set(
            state.currentProject.designBlocks[designIndex],
            "found",
            true
          );
        }
      }
      return designBlocks;
    },
    designImage: state => getObjectValue(state.currentProject, "designImage"),
    designParams: state => getObjectValue(state.currentProject, "designParams"),
    viewParams: state => getObjectValue(state.currentProject, "viewParams"),
    siteUrl: (state, getters) => {
      return getObjectValue(getters.frameParams, "siteUrl");
    },
    siteUrlProxy: (state, getters) => {
      if (!getters.siteUrl) {
        return;
      }
      return config.serverUrl + "/proxy/" + getters.siteUrl;
    },
    viewerReady: (state, getters) => {
      return (
        (getters.frameParams &&
          getters.frameParams.hasOwnProperty("siteUrl")) ||
        getters.foundNodes
      );
    },
    foundNodes: state => getObjectValue(state.currentProject, "foundNodes"),
    isFoundNodes: (state, getters) => {
      return getters.foundNodes && Object.entries(getters.foundNodes).length;
    },
    targetElement: state => state.targetElement
  },
  mutations: {
    SET_DESIGN(state, { blocks, image, params }) {
      if (!blocks || !blocks.hasOwnProperty("children")) {
        return;
      }
      const designBlocks = getParentAndChild(blocks.children)
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
          hide: i.width === params.width || i.height === params.height,
          text: (i.text && true) || false
        }));
      if (!designBlocks) {
        return;
      }
      if (!state.currentProject) {
        state.currentProject = {};
      }
      Vue.set(state.currentProject, "designBlocks", designBlocks);
      Vue.set(state.currentProject, "designImage", image);
      Vue.set(state.currentProject, "designParams", params);
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
          state.currentProject = {};
        }

        if (!state.currentProject.frameParams) {
          Vue.set(state.currentProject, "frameParams", {});
        }

        if (state.currentProject.frameParams.hasOwnProperty(key)) {
          state.currentProject.frameParams[key] = payload[key];
        } else {
          Vue.set(state.currentProject.frameParams, key, payload[key]);
        }
      }
    },
    SET_VIEW_PARAMS(state, payload) {
      if (!state.currentProject) {
        state.currentProject = {};
      }
      if (!state.currentProject.hasOwnProperty("viewParams")) {
        Vue.set(state.currentProject, "viewParams", payload);
      } else {
        for (let i in payload) {
          if (payload.hasOwnProperty(i))
            Vue.set(state.currentProject.viewParams, i, payload[i]);
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
      Vue.set(state.currentProject, "foundNodes", payload);
    },
    SET_CURRENT_PROJECT(state, payload) {
      state.currentProject = payload;
    },
    SET_CURRENT_FRAME(state, payload) {
      state.currentFrame = payload;
    },
    RESET_DESIGN(state) {
      Vue.delete(state.currentProject, "designBlocks");
      Vue.delete(state.currentProject, "designImage");
      Vue.delete(state.currentProject, "designParams");
    },
    RESET_HOMEPAGE_STATE(state) {
      state.currentProject = null;
      state.currentFrame = null;
    },
    SET_TARGET_ELEMENT(state, payload) {
      state.targetElement = payload;
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
    setViewParams({ commit }, payload) {
      commit("SET_VIEW_PARAMS", payload);
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
    resetDesign({ commit }) {
      commit("RESET_DESIGN");
    },
    resetHomepageState({ commit }) {
      commit("RESET_HOMEPAGE_STATE");
    },
    setTargetElement({ commit }, payload) {
      commit("SET_TARGET_ELEMENT", payload);
    }
  }
});

function getObjectValue(object, key) {
  return object && object.hasOwnProperty(key) && object[key];
}
