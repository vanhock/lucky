import Vue from "vue";
import {
  PROJECT_SET_CURRENT_PROJECT,
  PROJECT_EDIT_PROJECT,
  PROJECT_CREATE_PROJECT,
  PROJECT_GET_ALL_PROJECTS,
  PROJECT_MOVE_TO_TRASH
} from "./mutation-types";
import {
  createProject,
  editProject,
  getAllProjects,
  getProject,
  moveProjectToTrash
} from "../api/ProjectApi";

export default {
  state: {
    currentProject: {},
    projects: [],
    status: ""
  },
  getters: {
    projects: state => state.projects,
    hasProjects: state => state.projects && state.projects.length,
    currentProject: state => state.currentProject
  },
  mutations: {
    [PROJECT_EDIT_PROJECT](state, payload) {
      if (state.currentProject.id === payload.id)
        state.currentProject = payload;
      for (let key in state.projects) {
        if (
          state.projects.hasOwnProperty(key) &&
          state.projects[key].id === payload.id
        ) {
          Vue.set(state.projects, key, payload);
          break;
        }
      }
    },
    [PROJECT_SET_CURRENT_PROJECT](state, payload) {
      state.currentProject = payload;
    },
    [PROJECT_CREATE_PROJECT](state, payload) {
      state.projects.push(payload);
    },
    [PROJECT_MOVE_TO_TRASH](state, payload) {
      const projectIndex = state.projects.indexOf(payload);
      if (projectIndex !== -1) {
        state.projects.splice(projectIndex, 1);
      }
    },
    [PROJECT_GET_ALL_PROJECTS](state, payload) {
      state.projects = payload;
    }
  },
  actions: {
    [PROJECT_SET_CURRENT_PROJECT]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        getProject(payload, (error, project) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_SET_CURRENT_PROJECT, payload);
          resolve(project);
        });
      });
    },
    [PROJECT_CREATE_PROJECT]: ({ commit }, payload) => {
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
    [PROJECT_EDIT_PROJECT]: ({ commit }, payload) => {
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
    [PROJECT_MOVE_TO_TRASH]: ({ commit }, payload) => {
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
    [PROJECT_GET_ALL_PROJECTS]: ({ commit }) => {
      return new Promise((resolve, reject) => {
        getAllProjects((error, projects) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_GET_ALL_PROJECTS, projects);
          resolve(projects);
        });
      });
    }
  }
};
