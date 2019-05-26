import {
  TASK_CREATE_TASK,
  TASK_EDIT_TASK,
  TASK_GET_ALL_TASKS,
  TASK_MOVE_TO_TRASH,
  TASK_SET_CURRENT_TASK
} from "./mutation-types";
import {
  createTask,
  editTask,
  getAllTasks,
  moveTaskToTrash
} from "../api/TaskApi";
import { serializeObject } from "../../utils";
import Vue from "vue";
export default {
  state: {
    tasks: [],
    currentTask: {}
  },
  getters: {
    tasks: state => state.tasks || [],
    currentTask: state => state.currentTask,
    tasksCount: state => (state.tasks && state.tasks.length) || "",
    hasCurrentTask: state =>
      state.currentTask && Object.keys(state.currentTask).length
  },
  mutations: {
    [TASK_GET_ALL_TASKS](state, payload) {
      state.tasks = payload;
    },
    [TASK_CREATE_TASK](state, payload) {
      state.tasks.unshift(payload);
    },
    [TASK_EDIT_TASK](state, payload) {
      for (let key in state.tasks) {
        if (
          state.tasks.hasOwnProperty(key) &&
          state.tasks[key].id === payload.id
        ) {
          Vue.set(state.tasks, key, payload);
          break;
        }
      }
      if (state.currentTask && state.currentTask.id === payload.id) {
        state.currentTask = payload;
      }
    },
    [TASK_SET_CURRENT_TASK](state, payload) {
      state.currentTask = payload;
    },
    [TASK_MOVE_TO_TRASH](state, payload) {
      const index = state.tasks.indexOf(payload);
      if (index !== -1) {
        state.tasks.splice(index, 1);
      }
    }
  },
  actions: {
    [TASK_GET_ALL_TASKS]({ commit }, payload) {
      console.log("Try to get tasks");
      return new Promise((resolve, reject) => {
        getAllTasks(serializeObject(payload), (error, tasks) => {
          if (error) {
            return reject(error);
          }
          commit(TASK_GET_ALL_TASKS, tasks);
          resolve(tasks);
        });
      });
    },
    [TASK_CREATE_TASK]({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        createTask(payload, (error, task) => {
          if (error) {
            return reject(error);
          }
          commit(TASK_CREATE_TASK, task);
          resolve(task);
        });
      });
    },
    [TASK_EDIT_TASK]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        editTask(payload, (error, task) => {
          if (error) {
            return reject(error);
          }
          commit(TASK_EDIT_TASK, task);
          resolve(task);
        });
      });
    },
    [TASK_SET_CURRENT_TASK]({ commit }, payload) {
      commit(TASK_SET_CURRENT_TASK, payload);
    },
    [TASK_MOVE_TO_TRASH]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        moveTaskToTrash({ id: payload.id }, (error, success) => {
          if (error) {
            return reject(error);
          }
          commit(TASK_MOVE_TO_TRASH, payload);
          resolve(success);
        });
      });
    }
  }
};
