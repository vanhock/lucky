import {
  USER_LOGIN,
  USER_AUTH_SUCCESS,
  USER_AUTH_ERROR,
  USER_LOGOUT,
  USER_CHECK_AUTH,
  USER_REGISTER,
  USER_CHECK_USER_EXIST,
  USER_CONFIRMATION_REQUEST,
  USER_SEND_CONFIRMATION_CODE,
  USER_CHECK_USER_CONFIRMATION_CODE,
  USER_CHANGE_USER_INFO
} from "./mutation-types";
import PixelApi from "../api/api";
import {
  AuthByToken,
  Authorization,
  ChangeUserInfo,
  CheckUserConfirmationCode,
  CheckUserExist,
  Registration,
  SendConfirmationCode,
  SetAuthToken,
  UserConfirmationRequest
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
    userName: state => state.user && state.user.name,
    userStatus: state => state.user && state.user.status,
    userHasOneTimePassword: state => state.user && state.user.oneTimePassword
  },
  mutations: {
    [USER_LOGIN]: state => {
      state.status = "loading";
    },
    [USER_AUTH_SUCCESS](state, user) {
      state.status = "success";
      state.user = user;
      state.userToken = user.token;
    },
    [USER_AUTH_ERROR]: state => {
      state.status = "error";
    },
    [USER_LOGOUT]: state => {
      state.user = {};
      state.userToken = null;
    },
    [USER_CHECK_AUTH](state, payload = null) {
      state.user = payload;
      state.userToken = payload && payload.token;
    },
    [USER_SEND_CONFIRMATION_CODE](state, payload) {
      state.user = payload;
    },
    [USER_CONFIRMATION_REQUEST](state, payload) {
      state.user = payload;
    },
    [USER_CHANGE_USER_INFO](state, payload) {
      state.user = payload;
    }
  },
  actions: {
    [USER_LOGIN]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        commit(USER_LOGIN);
        Authorization(payload, (error, user) => {
          if (error) {
            commit(USER_AUTH_ERROR, error);
            localStorage.removeItem("pp-u-t-s");
            return reject(error);
          }
          localStorage.setItem("pp-u-t-s", user.token);
          PixelApi.setToken(user.token, () => {
            SetAuthToken(user.token);
            window.postMessage({ authorized: true }, location.href);
            commit(USER_AUTH_SUCCESS, user);
            resolve(user);
          });
        });
      });
    },
    [USER_REGISTER](undefined, payload) {
      return new Promise((resolve, reject) => {
        Registration(payload, (error, success) => {
          if (error) {
            return reject(error);
          }
          resolve(success);
        });
      });
    },
    [USER_LOGOUT]({ commit }) {
      return new Promise(resolve => {
        commit(USER_LOGOUT);
        localStorage.removeItem("pp-u-t-s");
        SetAuthToken("");
        resolve();
      });
    },
    [USER_CHECK_AUTH]({ commit }, payload) {
      console.log("auth check init");
      return new Promise((resolve, reject) => {
        AuthByToken(payload, (error, user) => {
          if (error || !user) {
            commit(USER_CHECK_AUTH);
            SetAuthToken("");
            localStorage.removeItem("pp-u-t-s");
            postMessage({ resetToken: true });
            return reject(error);
          }
          commit(USER_CHECK_AUTH, user);
          resolve(user);
        });
      });
    },
    [USER_CHECK_USER_EXIST]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        CheckUserExist(payload, error => {
          if (error) {
            return reject("User with this email not exist");
          }
          resolve();
        });
      });
    },
    [USER_CONFIRMATION_REQUEST]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        UserConfirmationRequest(payload, (error, user) => {
          if (error) {
            return reject(error);
          }
          commit(USER_CONFIRMATION_REQUEST, user);
          resolve(user);
        });
      });
    },
    [USER_SEND_CONFIRMATION_CODE]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        SendConfirmationCode(payload, (error, user) => {
          if (error) {
            return reject(error);
          }
          commit(USER_SEND_CONFIRMATION_CODE, user);
          resolve(user);
        });
      });
    },
    [USER_CHANGE_USER_INFO]({ commit }, payload) {
      return new Promise((resolve, reject) => {
        ChangeUserInfo(payload, (error, user) => {
          if (error) {
            return reject(error);
          }
          commit(USER_CHANGE_USER_INFO, user);
          resolve(user);
        });
      });
    }
  }
};
