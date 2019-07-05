import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_ERROR,
  AUTH_LOGOUT,
  AUTH_CHECK_AUTH
} from "./mutation-types";
import PixelApi from "../api/api";
import {
  AuthAsClient,
  AuthByToken,
  Authorization,
  SetAuthToken
} from "../api/UserApi";
export default {
  state: {
    user: {},
    userToken: localStorage.getItem("pp-u-t-s"),
    status: ""
  },
  getters: {
    isAuthenticated: state => state.userToken,
    status: state => state.status,
    user: state => state.user,
    userName: state => state.user && state.user.name
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
      localStorage.removeItem("pp-u-t-s");
    },
    [AUTH_CHECK_AUTH]: (state, payload = null) => {
      state.user = payload;
      state.userToken = payload.token;
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
          localStorage.setItem("pp-u-t-s", user.token);
          PixelApi.setToken(user.token, () => {
            SetAuthToken(user.token);
            window.postMessage({ authorized: true }, "*");
            commit(AUTH_SUCCESS, user);
            resolve(user);
          });
        });
      });
    },
    [AUTH_LOGOUT]: ({ commit }) => {
      return new Promise(resolve => {
        commit(AUTH_LOGOUT);
        SetAuthToken("");
        resolve();
      });
    },
    AUTH_CHECK_AUTH({ commit }, payload) {
      console.log("auth check init");
      return new Promise((resolve, reject) => {
        AuthByToken(payload, (error, user) => {
          if (error || !user) {
            commit(AUTH_CHECK_AUTH);
            SetAuthToken("");
            localStorage.removeItem("pp-u-t-s");
            postMessage({ resetToken: true });
            return reject(error);
          }
          commit(AUTH_CHECK_AUTH, user);
          resolve(user);
        });
      });
    }
  }
};
