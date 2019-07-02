import Vue from "vue";
import {
  PROJECT_SET_CURRENT_PROJECT,
  PROJECT_EDIT_PROJECT,
  PROJECT_CREATE_PROJECT,
  PROJECT_GET_PROJECTS,
  PROJECT_MOVE_TO_TRASH,
  PROJECT_SET_SCREENSHOT,
  PROJECT_CHECK_ACCESS
} from "./mutation-types";
import {
  createProject,
  downloadProjectResources,
  editProject,
  getAllProjects,
  getProject,
  moveProjectToTrash,
  checkAccessToProject
} from "../api/ProjectApi";
import { serializeObject } from "../../utils";

export default {
  state: {
    currentProject: {},
    projects: []
  },
  getters: {
    projects: state => state.projects,
    lastProjects: state => state.projects.filter((el, index) => index <= 2),
    hasProjects: state => state.projects && state.projects.length,
    currentProject: state => state.currentProject,
    currentProjectUrl: state =>
      Object.keys(state.currentProject).length && state.currentProject.url,
    hasCurrentProject: state =>
      state.currentProject && Object.keys(state.currentProject).length
  },
  mutations: {
    [PROJECT_EDIT_PROJECT](state, payload) {
      for (let key in state.projects) {
        if (
          state.projects.hasOwnProperty(key) &&
          state.projects[key].id === payload.id
        ) {
          Vue.set(state.projects, key, payload);
          break;
        }
      }
      if (state.currentProject && state.currentProject.id === payload.id) {
        state.currentProject = payload;
      }
    },
    [PROJECT_SET_CURRENT_PROJECT](state, payload) {
      state.currentProject = payload;
    },
    [PROJECT_CREATE_PROJECT](state, payload) {
      state.projects.unshift(payload);
    },
    [PROJECT_MOVE_TO_TRASH](state, payload) {
      const projectIndex = state.projects.indexOf(payload);
      if (projectIndex !== -1) {
        state.projects.splice(projectIndex, 1);
      }
    },
    [PROJECT_GET_PROJECTS](state, payload) {
      state.projects = payload;
    }
  },
  actions: {
    [PROJECT_SET_CURRENT_PROJECT]({ commit }, payload) {
      console.log("Try to set current project");
      if (!payload) {
        commit(PROJECT_SET_CURRENT_PROJECT, {});
      }
      return new Promise((resolve, reject) => {
        getProject(serializeObject(payload), (error, project) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_SET_CURRENT_PROJECT, project);
          resolve(project);
        });
      });
    },
    [PROJECT_CREATE_PROJECT]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        createProject(payload, (error, project) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_CREATE_PROJECT, project);
          resolve(project);
        });
      });
    },
    [PROJECT_EDIT_PROJECT]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        editProject(payload, (error, project) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_EDIT_PROJECT, project);
          resolve(project);
        });
      });
    },
    [PROJECT_SET_SCREENSHOT]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        downloadProjectResources(payload, (error, image) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_EDIT_PROJECT, image);
        });
      });
    },
    [PROJECT_MOVE_TO_TRASH]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        moveProjectToTrash({ id: payload.id }, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_MOVE_TO_TRASH, payload);
          resolve(success);
        });
      });
    },
    [PROJECT_GET_PROJECTS]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        getAllProjects(serializeObject(payload), (error, projects) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_GET_PROJECTS, projects);
          resolve(projects);
        });
      });
    },
    [PROJECT_CHECK_ACCESS](payload) {
      return new Promise((resolve, reject) => {
        checkAccessToProject(serializeObject(payload), (error, project) => {
          if (error) {
            return reject(error);
          }
          resolve(project);
        });
      });
    }
  }
};
