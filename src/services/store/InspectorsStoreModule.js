import Vue from "vue";
import config from "../../config";
import { getParentAndChild } from "../../atoms/utils";
import {
  INSPECTOR_RESET_DESIGN,
  INSPECTOR_SET_CURRENT_FRAME,
  INSPECTOR_SET_DESIGN,
  INSPECTOR_SET_FOUND_NODES,
  INSPECTOR_SET_FRAME_PARAMS,
  INSPECTOR_SET_TARGET_ELEMENT,
  INSPECTOR_SET_VIEW_PARAMS,
  INSPECTOR_SET_WEBSITE_URL
} from "./mutation-types";

export default {
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
    [INSPECTOR_SET_DESIGN](state, { blocks, image, params }) {
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
    [INSPECTOR_SET_FRAME_PARAMS](state, payload) {
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
    [INSPECTOR_SET_VIEW_PARAMS](state, payload) {
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
    [INSPECTOR_SET_FOUND_NODES](state, payload) {
      if (!state.currentProject) {
        state.currentProject = {};
      }
      Vue.set(state.currentProject, "foundNodes", payload);
    },
    [INSPECTOR_SET_CURRENT_FRAME](state, payload) {
      state.currentFrame = payload;
    },
    [INSPECTOR_RESET_DESIGN](state) {
      Vue.delete(state.currentProject, "designBlocks");
      Vue.delete(state.currentProject, "designImage");
      Vue.delete(state.currentProject, "designParams");
    },
    [INSPECTOR_SET_TARGET_ELEMENT](state, payload) {
      state.targetElement = payload;
    }
  },
  actions: {
    [INSPECTOR_SET_DESIGN]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_DESIGN", payload);
    },
    [INSPECTOR_SET_WEBSITE_URL]: ({ commit }, payload) => {
      const url =
        "https://" + payload.replace("http://", "").replace("https://", "");
      return new Promise(resolve => {
        commit("INSPECTOR_SET_WEBSITE_URL", { websiteUrl: url });
        resolve(url);
      });
    },
    [INSPECTOR_SET_FRAME_PARAMS]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_FRAME_PARAMS", payload);
    },
    [INSPECTOR_SET_VIEW_PARAMS]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_VIEW_PARAMS", payload);
    },
    [INSPECTOR_SET_FOUND_NODES]: ({ commit, state }, payload) => {
      return new Promise(resolve => {
        commit("INSPECTOR_SET_FOUND_NODES", payload);
        resolve(state.currentProject);
      });
    },
    [INSPECTOR_SET_CURRENT_FRAME]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_CURRENT_FRAME", payload);
    },
    [INSPECTOR_RESET_DESIGN]: ({ commit }) => {
      commit("INSPECTOR_RESET_DESIGN");
    },
    [INSPECTOR_SET_TARGET_ELEMENT]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_TARGET_ELEMENT", payload);
    }
  }
};

function getObjectValue(object, key) {
  return object && object.hasOwnProperty(key) && object[key];
}
