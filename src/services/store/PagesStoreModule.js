import Vue from "vue";
import {
  PAGE_SET_CURRENT_PAGE,
  PAGE_CREATE_PAGE,
  PAGE_GET_PAGES,
  PAGE_MOVE_TO_TRASH,
  PAGE_EDIT_PAGE,
  PAGE_GET_PAGE,
  TASK_GET_ALL_TASKS
} from "./mutation-types";
import {
  createPage,
  editPage,
  getPages,
  getPage,
  movePageToTrash
} from "../api/PageApi";
import { serializeObject } from "../../utils";

export default {
  state: {
    currentPage: {},
    pages: []
  },
  getters: {
    currentPage: state => state.currentPage,
    pages: state => state.pages,
    hasPages: state => state.pages && state.pages.length,
    hasCurrentPage: state =>
      state.currentPage && Object.keys(state.currentPage).length
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
    [PAGE_MOVE_TO_TRASH](state, payload) {
      const pageIndex = state.pages.indexOf(payload);
      if (pageIndex !== -1) {
        state.pages.splice(pageIndex, 1);
      }
      state.currentPage.id === payload.id ? (state.currentPage = {}) : "";
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
    [PAGE_MOVE_TO_TRASH]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        movePageToTrash(
          { id: payload.id, projectId: payload.projectId },
          (error, success) => {
            if (error) {
              return reject(error);
            }
            commit(PAGE_MOVE_TO_TRASH, payload);
            resolve(success);
          }
        );
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
