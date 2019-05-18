import axios from "axios";
import config from "../../config";
import store from "../store/store";
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
    return { status: response.status, data: response.data };
  }

  handleError = error => {
    switch (error.response.status) {
      case 401:
        if (location.href.includes(config.apiUrl)) {
          document.location = "/log-out";
        } else if (store.getters.port) {
          store.getters.port.postMessage({ resetToken: true });
        }
    }
    return {
      status: error.response.status || error.response.code,
      data: error.response.data.errors[0].title
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
      .then(response => callback(response.status, response.data));
  }

  patch(path, payload, callback) {
    return this.api
      .request({
        method: "PATCH",
        url: config.apiUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => callback(response.status, response));
  }

  post(path, payload, callback) {
    return this.api
      .request({
        method: "POST",
        url: config.apiUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => callback(response.status, response.data));
  }
}

export default new PixelApi();
