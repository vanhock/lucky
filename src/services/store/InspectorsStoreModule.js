import Vue from "vue";
import {
  INSPECTOR_SET_DESIGN,
  INSPECTOR_SET_FOUND_NODES,
  INSPECTOR_SET_STATE,
  INSPECTOR_SET_TARGET_ELEMENT,
  INSPECTOR_SET_TASK_CREATOR_STATE,
  INSPECTOR_SET_VIEW_PARAMS
} from "./mutation-types";

export const INSPECTOR_STATE_INSPECTING = "INSPECTOR_STATE_INSPECTING";
export const INSPECTOR_STATE_CREATING = "INSPECTOR_STATE_CREATING";

export const INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT =
  "INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT";
export const INSPECTOR_CREATOR_STATE_SELECTING_AREA =
  "INSPECTOR_CREATOR_STATE_SELECTING_AREA";
export const INSPECTOR_CREATOR_STATE_SETTING_TASK =
  "INSPECTOR_CREATOR_STATE_SETTING_TASK";

export default {
  state: {
    state: INSPECTOR_STATE_INSPECTING,
    taskCreatorState: INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT,
    viewParams: {
      websiteWidth: window.innerWidth + "px",
      websiteHeight: window.innerHeight - 24 + "px",
      websiteUrl: null,
      showWebsiteInspector: true,
      showDesignInspector: false,
      websiteInspectorPercentage: 50,
      showDesignViewMode: "found",
      showWebsiteViewMode: "found",
      syncScroll: false
    },
    foundNodes: {},
    designBlocks: {},
    designImage: "",
    targetElement: {}
  },
  getters: {
    state: state => state.state,
    taskCreatorState: state => state.taskCreatorState,
    viewParams: state => state.viewParams,
    designBlocks: state => state.designBlocks,
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
    designImage: state => state.designImage,
    foundNodes: state => state.foundNodes,
    isFoundNodes: state => {
      return state.foundNodes && Object.entries(state.foundNodes).length;
    },
    targetElement: state => state.targetElement,
    hasDesign: state =>
      state.designBlocks && Object.keys(state.designBlocks).length
  },
  mutations: {
    [INSPECTOR_SET_STATE](state, payload) {
      state.state = payload;
    },
    [INSPECTOR_SET_TASK_CREATOR_STATE](state, payload) {
      state.taskCreatorState = payload;
    },
    [INSPECTOR_SET_DESIGN](state, payload) {
      state.designBlocks = payload.designBlocks;
      state.designImage = payload.designImage;
    },
    [INSPECTOR_SET_FOUND_NODES](state, payload) {
      state.foundNodes = payload;
    },
    [INSPECTOR_SET_VIEW_PARAMS](state, payload) {
      for (let key in payload) {
        if (!payload.hasOwnProperty(key)) {
          continue;
        }
        Vue.$set(state.viewParams, key, payload[key]);
      }
    },
    [INSPECTOR_SET_TARGET_ELEMENT](state, payload) {
      state.targetElement = payload;
    }
  },
  actions: {
    [INSPECTOR_SET_STATE]: ({ commit }, payload) => {
      commit(INSPECTOR_SET_STATE, payload);
    },
    [INSPECTOR_SET_TASK_CREATOR_STATE]: ({ commit }, payload) => {
      commit(INSPECTOR_SET_TASK_CREATOR_STATE, payload);
    },
    [INSPECTOR_SET_DESIGN]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_DESIGN", payload);
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
    [INSPECTOR_SET_TARGET_ELEMENT]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_TARGET_ELEMENT", payload);
    }
  }
};
