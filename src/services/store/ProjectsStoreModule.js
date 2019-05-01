import {
  PROJECT_SET_CURRENT_PROJECT,
  PROJECT_EDIT_PROJECT,
  PROJECT_CREATE_PROJECT,
  PROJECT_DELETE_PROJECT,
  PROJECT_GET_ALL_PROJECTS
} from "./mutation-types";
import {
  createProject,
  deleteProject,
  editProject,
  getAllProjects
} from "../api/ProjectApi";

export default {
  state: {
    currentProject: {},
    projects: [],
    status: ""
  },
  getters: {
    projects: state => state.projects,
    hasProjects: state => state.projects && state.projects.length
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
          state.projects[key] = payload;
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
    [PROJECT_DELETE_PROJECT](state, payload) {
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
      commit(PROJECT_SET_CURRENT_PROJECT, payload);
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
    [PROJECT_DELETE_PROJECT]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        deleteProject(payload, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(PROJECT_DELETE_PROJECT, payload);
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
