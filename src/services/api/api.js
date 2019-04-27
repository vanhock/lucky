import axios from "axios";
import config from "../../config";

class PixelApi {
  constructor() {
    let api = axios.create({
      headers: { authorization: localStorage.getItem("authorization") || "" }
    });
    api.interceptors.response.use(PixelApi.handleSuccess, this.handleError);
    this.api = api;
  }

  static handleSuccess(response) {
    return response;
  }

  handleError = error => {
    switch (error.response.status) {
      case 401:
        this.redirectTo(document, "/");
        break;
      case 404:
        this.redirectTo(document, "/404");
        break;
      default:
        this.redirectTo(document, "/500");
        break;
    }
    return Promise.reject(error);
  };

  redirectTo = (document, path) => {
    document.location = path;
  };

  get(path, payload, callback) {
    return this.api
      .get(config.serverUrl + path, payload.data)
      .then(response => callback(response.status, response.data));
  }

  patch(path, payload, callback) {
    return this.api
      .request({
        method: "PATCH",
        url: config.serverUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => callback(response.status, response.data));
  }

  post(path, payload, callback) {
    return this.api
      .request({
        method: "POST",
        url: config.serverUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => callback(response.status, response.data));
  }
}

export default new PixelApi();
