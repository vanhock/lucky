import axios from "axios";
import config from "../../config";
import store from "../store/store";
import { USER_LOGOUT } from "../store/mutation-types";
class PixelApi {
  constructor() {
    let api = axios.create({
      headers: {
        authorization:
          localStorage.getItem("pp-u-t-s") || sessionStorage.getItem("pp-u-t-s")
      }
    });
    api.interceptors.response.use(PixelApi.handleSuccess, this.handleError);
    this.api = api;
  }

  static handleSuccess(response) {
    if (!response) {
      return;
    }
    return { status: response.status, data: response.data };
  }

  handleError = error => {
    const resp = error.response;
    if (!resp) {
      return;
    }
    switch (resp.status) {
      case 401:
        if (location.href.includes(config.apiUrl)) {
          if (!location.href.includes(`${config.apiUrl}/i`)) {
            store.dispatch(USER_LOGOUT).then(() => {
              document.location = "/sign-in";
            });
          }
        } else if (store.getters.port) {
          store.getters.port.postMessage({ resetToken: true });
        }
        break;
      case 403:
        break;
    }
    return {
      status: resp.status || resp.code,
      data: (resp.data && resp.data.errors[0].title) || resp.statusText
    };
  };

  redirectTo = (document, path) => {
    document.location = path;
  };

  setToken(token, callback) {
    this.api.defaults.headers["authorization"] = token;
    callback();
  }

  get(path, callback) {
    return this.api
      .request({
        method: "GET",
        url: config.apiUrl + path,
        responseType: "json"
      })
      .then(response => response && callback(response.status, response.data));
  }

  patch(path, payload, callback) {
    return this.api
      .request({
        method: "PATCH",
        url: config.apiUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => response && callback(response.status, response));
  }

  post(path, payload, callback) {
    return this.api
      .request({
        method: "POST",
        url: config.apiUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => response && callback(response.status, response.data));
  }
}

export default new PixelApi();
