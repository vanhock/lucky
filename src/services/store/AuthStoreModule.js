import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_ERROR,
  AUTH_LOGOUT
} from "./mutation-types";
import PixelApi from "../api/api";
export default {
  state: {
    user: {},
    userToken: localStorage.getItem("user-token"),
    status: ""
  },
  getters: {
    isAuthenticated: state => state.userToken,
    status: state => state.status
  },
  mutations: {
    [AUTH_REQUEST]: state => {
      state.status = "loading";
    },
    [AUTH_SUCCESS]: (state, user) => {
      state.status = "success";
      state.user = user;
      state.userToken = user.token;
    },
    [AUTH_ERROR]: state => {
      state.status = "error";
    },
    [AUTH_LOGOUT]: state => {
      state.user = {};
      state.userToken = null;
    }
  },
  actions: {
    [AUTH_REQUEST]: ({ commit }, user) => {
      return new Promise((resolve, reject) => {
        commit(AUTH_REQUEST);
        PixelApi.post("/authorization", { data: user }, (status, data) => {
          if (status !== 200) {
            commit(AUTH_ERROR, data);
            localStorage.removeItem("user-token");
            return reject(data);
          }
          localStorage.setItem("user-token", data.token);
          commit(AUTH_SUCCESS, data);
          resolve(data);
        });
      });
    },
    [AUTH_LOGOUT]: ({ commit }) => {
      return new Promise(resolve => {
        commit(AUTH_LOGOUT);
        localStorage.removeItem("user-token"); // clear your user's token from localstorage
        resolve();
      });
    }
  }
};
