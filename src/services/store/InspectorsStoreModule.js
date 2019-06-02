import {
  INSPECTOR_SET_DESIGN,
  INSPECTOR_SET_FOUND_NODES,
  INSPECTOR_SET_STATE,
  INSPECTOR_SET_STATUS,
  INSPECTOR_SET_TARGET_ELEMENT,
  INSPECTOR_SET_TOOL
} from "./mutation-types";

export const INSPECTOR_STATE_INSPECTING = "INSPECTOR_STATE_INSPECTING";
export const INSPECTOR_STATE_CREATING = "INSPECTOR_STATE_CREATING";

export const INSPECTOR_TOOL_DOM_INSPECTOR = "INSPECTOR_TOOL_DOM_INSPECTOR";
export const INSPECTOR_TOOL_RECTANGLE = "INSPECTOR_TOOL_RECTANGLE";
export const INSPECTOR_TOOL_OVAL = "INSPECTOR_TOOL_OVAL";
export const INSPECTOR_TOOL_LINE = "INSPECTOR_TOOL_LINE";
export const INSPECTOR_TOOL_PENCIL = "INSPECTOR_TOOL_PENCIL";
export const INSPECTOR_TOOL_BLUR = "INSPECTOR_TOOL_BLUR";
export const INSPECTOR_TOOL_TEXT = "INSPECTOR_TOOL_TEXT";

export default {
  state: {
    websiteStatus: "complete",
    state: INSPECTOR_STATE_INSPECTING,
    tool: INSPECTOR_TOOL_DOM_INSPECTOR,
    taskCreatorForm: {},
    currentDrawTool: "",
    foundNodes: {},
    designBlocks: {},
    designImage: "",
    targetElement: {}
  },
  getters: {
    state: state => state.state,
    tool: state => state.tool,
    websiteStatus: state => state.websiteStatus,
    taskCreatorState: state => state.taskCreatorState,
    taskCreatorForm: state => state.taskCreatorForm,
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
    [INSPECTOR_SET_STATUS](state, payload) {
      state[`${payload.inspector}Status`] = payload.status;
    },
    [INSPECTOR_SET_STATE](state, payload) {
      state.state = payload;
    },
    [INSPECTOR_SET_TOOL](state, payload) {
      state.tool = payload;
    },
    [INSPECTOR_SET_DESIGN](state, payload) {
      state.designBlocks = payload.designBlocks;
      state.designImage = payload.designImage;
    },
    [INSPECTOR_SET_FOUND_NODES](state, payload) {
      state.foundNodes = payload;
    },
    [INSPECTOR_SET_TARGET_ELEMENT](state, payload) {
      state.targetElement = payload;
    }
  },
  actions: {
    [INSPECTOR_SET_STATUS]({ commit }, payload) {
      commit(INSPECTOR_SET_STATUS, payload);
    },
    [INSPECTOR_SET_STATE]: ({ commit }, payload) => {
      commit(INSPECTOR_SET_STATE, payload);
    },
    [INSPECTOR_SET_TOOL]: ({ commit }, payload) => {
      commit(INSPECTOR_SET_TOOL, payload);
    },
    [INSPECTOR_SET_DESIGN]: ({ commit }, payload) => {
      commit("INSPECTOR_SET_DESIGN", payload);
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
