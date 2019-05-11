import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_ERROR,
  AUTH_LOGOUT,
  AUTH_CHECK_AUTH
} from "./mutation-types";
import PixelApi from "../api/api";
import { AuthByToken, Authorization } from "../api/UserApi";
export default {
  state: {
    user: {},
    userToken: localStorage.getItem("pp-u-t-s"),
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
    },
    [AUTH_CHECK_AUTH]: (state, payload = null) => {
      state.userToken = payload;
    }
  },
  actions: {
    [AUTH_REQUEST]: ({ commit }, payload) => {
      return new Promise((resolve, reject) => {
        commit(AUTH_REQUEST);
        Authorization(payload, (error, user) => {
          if (error) {
            commit(AUTH_ERROR, error);
            localStorage.removeItem("pp-u-t-s");
            return reject(error);
          }
          PixelApi.setToken(user.token, () => {
            localStorage.setItem("pp-u-t-s", user.token);
            window.postMessage({ authorized: user.token }, "*");
            commit(AUTH_SUCCESS, user);
            resolve(user);
          });
        });
      });
    },
    [AUTH_LOGOUT]: ({ commit }) => {
      return new Promise(resolve => {
        commit(AUTH_LOGOUT);
        localStorage.removeItem("pp-u-t-s"); // clear your user's token from localstorage
        resolve();
      });
    },
    AUTH_CHECK_AUTH({ commit }, payload) {
      console.log("auth check init");
      return new Promise((resolve, reject) => {
        AuthByToken(payload, (error, user) => {
          if (error || !user) {
            commit(AUTH_CHECK_AUTH);
            return reject();
          }
          commit(AUTH_CHECK_AUTH, user.token);
          return resolve(user);
        });
      });
    }
  }
};
