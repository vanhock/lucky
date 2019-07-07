import {
  TRASH_DELETE_PAGE,
  TRASH_DELETE_PROJECT,
  TRASH_DELETE_TASK,
  TRASH_GET_PROJECTS_TRASH,
  TRASH_GET_TASKS_TRASH,
  TRASH_RESTORE_PROJECT,
  TRASH_RESTORE_TASK
} from "./mutation-types";
import {
  getProjectsTrash,
  restoreProject,
  deleteProject,
  deletePage,
  deleteTask,
  restoreTask,
  getTasksTrash
} from "../api/TrashApi";

export default {
  state: {
    projectsTrash: [],
    pagesTrash: [],
    tasksTrash: [],
    status: ""
  },
  getters: {
    projectsTrash: state => state.projectsTrash,
    pagesTrash: state => state.pagesTrash,
    tasksTrash: state => state.tasksTrash
  },
  mutations: {
    [TRASH_RESTORE_PROJECT](state, payload) {
      removeTrashElement(state, payload.id, "projects");
    },
    [TRASH_DELETE_PROJECT](state, payload) {
      if (!payload.id) {
        return;
      }
      payload.id.forEach(id => {
        removeTrashElement(state, id, "projects");
      });
    },
    [TRASH_GET_PROJECTS_TRASH](state, projects) {
      state.projectsTrash = projects;
    },
    [TRASH_DELETE_PAGE](state, payload) {
      removeTrashElement(state, payload, "pages");
    },
    [TRASH_RESTORE_TASK](state, payload) {
      removeTrashElement(state, payload, "tasks");
    },
    [TRASH_DELETE_TASK](state, payload) {
      removeTrashElement(state, payload, "tasks");
    },
    [TRASH_GET_TASKS_TRASH](state, tasks) {
      state.tasksTrash = tasks;
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
        deleteProject({ id: payload.id }, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(TRASH_DELETE_PROJECT, payload);
          resolve(success);
        });
      });
    },
    [TRASH_DELETE_PAGE]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        deletePage({ id: payload.id }, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(TRASH_DELETE_PAGE, payload);
          resolve(success);
        });
      });
    },
    [TRASH_GET_TASKS_TRASH]: ({ commit }) => {
      return new Promise((resolve, reject) => {
        getTasksTrash((error, projects) => {
          if (error) {
            return reject(error);
          }
          commit(TRASH_GET_TASKS_TRASH, projects);
          resolve(projects);
        });
      });
    },
    [TRASH_RESTORE_TASK]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        restoreTask({ id: payload.id }, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(TRASH_RESTORE_TASK, payload);
          resolve(success);
        });
      });
    },
    [TRASH_DELETE_TASK]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        deleteTask({ id: payload.id }, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(TRASH_DELETE_TASK, payload);
          resolve(success);
        });
      });
    }
  }
};

function removeTrashElement(state, id, trashType) {
  state[`${trashType}Trash`].some((item, index) => {
    if (item.id === id) {
      return state[`${trashType}Trash`].splice(index, 1);
    }
  });
}
