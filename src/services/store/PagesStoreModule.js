import Vue from "vue";
import {
  PAGE_SET_CURRENT_PAGE,
  PAGE_CREATE_PAGE,
  PAGE_GET_PAGES,
  PAGE_EDIT_PAGE,
  PAGE_GET_PAGE,
  TASK_GET_ALL_TASKS,
  PAGE_SET_VIEW_PARAMS
} from "./mutation-types";
import {
  createPage,
  editPage,
  getPages,
  getPage,
} from "../api/PageApi";
import { serializeObject } from "../../utils";

export default {
  state: {
    currentPage: {
      websiteWidth: window.innerWidth + "px",
      websiteHeight: window.innerHeight - 24 + "px",
      url: null,
      showWebsiteInspector: true,
      showDesignInspector: false,
      websiteInspectorPercentage: 50,
      showDesignViewMode: "found",
      showWebsiteViewMode: "found",
      syncScroll: false
    },
    pages: []
  },
  getters: {
    currentPage: state => state.currentPage,
    pages: state => state.pages,
    hasPages: state => state.pages && state.pages.length,
    hasCurrentPage: state =>
      state.currentPage && Object.keys(state.currentPage).length,
    showDesignInspector: state => state.currentPage.showDesignInspector,
    showWebsiteInspector: state => state.currentPage.showWebsiteInspector,
    compareMode: state => state.currentPage.compareMode
  },
  mutations: {
    [PAGE_EDIT_PAGE](state, payload) {
      if (state.currentPage.id === payload.id) state.currentPage = payload;
      for (let key in state.pages) {
        if (
          state.pages.hasOwnProperty(key) &&
          state.pages[key].id === payload.id
        ) {
          Vue.set(state.pages, key, payload);
          break;
        }
      }
    },
    [PAGE_SET_CURRENT_PAGE](state, payload) {
      state.currentPage = payload;
    },
    [PAGE_CREATE_PAGE](state, payload) {
      state.pages.push(payload);
    },
    [PAGE_GET_PAGES](state, payload) {
      state.pages = payload;
    },
    [PAGE_GET_PAGE](state, payload) {
      state.currentPage = payload;
    }
  },
  actions: {
    [PAGE_SET_CURRENT_PAGE]: ({ commit, dispatch }, payload) => {
      console.log("Try to set current page");
      commit(PAGE_SET_CURRENT_PAGE, payload);
      dispatch(TASK_GET_ALL_TASKS, { pageId: payload.id });
    },
    [PAGE_CREATE_PAGE]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        createPage(payload, (error, page) => {
          if (error) {
            return reject(error);
          }
          commit(PAGE_CREATE_PAGE, page);
          resolve(page);
        });
      });
    },
    [PAGE_EDIT_PAGE]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        editPage(payload, (error, page) => {
          if (error) {
            return reject(error);
          }
          commit(PAGE_EDIT_PAGE, page);
          resolve(page);
        });
      });
    },
    [PAGE_GET_PAGES]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        getPages(serializeObject(payload), (error, pages) => {
          if (error) {
            return reject(error);
          }
          commit(PAGE_GET_PAGES, pages);
          resolve(pages);
        });
      });
    },
    [PAGE_GET_PAGE]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        getPage(serializeObject(payload), (error, page) => {
          if (error) {
            return reject(error);
          }
          commit(PAGE_GET_PAGE, page);
          resolve(page);
        });
      });
    }
  }
};
