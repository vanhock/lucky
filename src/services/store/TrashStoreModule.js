import {
  TRASH_DELETE_PROJECT,
  TRASH_GET_PROJECTS_TRASH,
  TRASH_RESTORE_PROJECT
} from "./mutation-types";
import {
  getProjectsTrash,
  restoreProject,
  deleteProject
} from "../api/TrashApi";

export default {
  state: {
    projectsTrash: [],
    pagesTrash: [],
    status: ""
  },
  getters: {
    projectsTrash: state => state.projectsTrash,
    pagesTrash: state => state.pagesTrash
  },
  mutations: {
    [TRASH_RESTORE_PROJECT](state, payload) {
      removeTrashElement(state, payload, "projects");
    },
    [TRASH_DELETE_PROJECT](state, payload) {
      removeTrashElement(state, payload, "projects");
    },
    [TRASH_GET_PROJECTS_TRASH](state, projects) {
      state.projectsTrash = projects;
    }
  },
  actions: {
    [TRASH_GET_PROJECTS_TRASH]: ({ commit }) => {
      return new Promise((resolve, reject) => {
        getProjectsTrash((error, projects) => {
          if (error) {
            return reject(error);
          }
          commit(TRASH_GET_PROJECTS_TRASH, projects);
          resolve(projects);
        });
      });
    },
    [TRASH_RESTORE_PROJECT]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        restoreProject({ id: payload.id }, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(TRASH_RESTORE_PROJECT, payload);
          resolve(success);
        });
      });
    },
    [TRASH_DELETE_PROJECT]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        deleteProject(
          { id: payload.id, name: payload.name },
          (error, success) => {
            if (error) {
              return reject(error);
            }
            commit(TRASH_DELETE_PROJECT, payload);
            resolve(success);
          }
        );
      });
    }
  }
};

function removeTrashElement(state, payload, trashType) {
  const index = state[`${trashType}Trash`].indexOf(payload);
  if (index === -1) {
    return;
  }
  state[`${trashType}Trash`].splice(index, 1);
}
