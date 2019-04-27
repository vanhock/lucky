import Vue from "vue";
import Vuex from "vuex";
import config from "./config";
import { getParentAndChild } from "./atoms/utils";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    appTheme: "white",
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
     *   showFoundDesignBlocks: true,
     *   syncScroll: false
     * }
     *
     **/
    recentProjects: null,
    targetElement: null
  },
  getters: {
    viewerReady: state => {
      return (
        getObjectValue(state.currentProject, "designBlocks") &&
        getObjectValue(state.currentProject, "designParams") &&
        getObjectValue(state.currentProject, "frameParams") &&
        getObjectValue(state.currentProject.frameParams, "websiteUrl")
      );
    },
    viewParams: state => getObjectValue(state.currentProject, "viewParams"),
    designParams: state => getObjectValue(state.currentProject, "designParams"),
    frameParams: state => getObjectValue(state.currentProject, "frameParams"),
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
    designBlocks: state => getObjectValue(state.currentProject, "designBlocks"),
    foundDesignBlocks: (state, getters) => {
      const foundNodes = getters.foundNodes;
      const designBlocks = getters.designBlocks;
      if (!foundNodes || !Object.keys(foundNodes).length) {
        return designBlocks;
      }
      let found = [];
      designBlocks.forEach(block => (found = [...found, { ...block }]));
      let nodeIndex = 0;
      for (let i in foundNodes) {
        if (!foundNodes.hasOwnProperty(i)) {
          continue;
        }
        const index = foundNodes[i].designBlockIndex;
        if (designBlocks.hasOwnProperty(index)) {
          found[index].foundNodeIndex = nodeIndex;
          found[index].nodeIndex = i;
        }
        nodeIndex++;
      }
      return found;
    },
    designImage: state => getObjectValue(state.currentProject, "designImage"),
    websiteUrl: (state, getters) => {
      return getObjectValue(getters.frameParams, "websiteUrl");
    },
    websiteUrlProxy: (state, getters) => {
      if (!getters.websiteUrl) {
        return;
      }
      return config.serverUrl + "/proxy/" + getters.websiteUrl;
    },
    foundNodes: state => getObjectValue(state.currentProject, "foundNodes"),
    isFoundNodes: (state, getters) => {
      return getters.foundNodes && Object.entries(getters.foundNodes).length;
    },
    targetElement: state => state.targetElement
  },
  mutations: {
    SET_USER_DATA(state, { user }) {
      state.user = user;
    },
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
          text: i.text &&
            Object.keys(i.text).length && {
              value: i.text.value && i.text.value.trim().toLowerCase(),
              fontSize: i.text.font.sizes && i.text.font.sizes[0],
              fontFamily: i.text.font.name,
              align: i.text.font.alignment[0],
              color:
                i.text.font.colors &&
                i.text.font.colors[0] &&
                i.text.font.colors[0].join(",")
            },
          image: {}
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
    setUserData({ commit }, payload) {
      commit("SET_USER_DATA", payload);
    },
    setDesign({ commit }, payload) {
      commit("SET_DESIGN", payload);
    },
    setSiteUrl({ commit }, payload) {
      const url =
        "https://" + payload.replace("http://", "").replace("https://", "");
      return new Promise(resolve => {
        commit("SET_FRAME_PARAMS", { websiteUrl: url });
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
