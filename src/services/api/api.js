import axios from "axios";
import config from "../../config";

class PixelApi {
  constructor() {
    let api = axios.create({
      headers: { authorization: localStorage.getItem("user-token") || "" }
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
        document.location = "/log-out";
        break;
      default:
        return {
          status: error.response.status,
          data: error.response.data.errors[0].title
        };
    }
  };

  redirectTo = (document, path) => {
    document.location = path;
  };

  get(path, payload, callback) {
    return this.api
      .request({
        method: "GET",
        url: config.serverUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => callback(response.status, response.data))
      .catch(response => {
        callback(response.status, response);
      });
  }

  patch(path, payload, callback) {
    return this.api
      .request({
        method: "PATCH",
        url: config.serverUrl + path,
        responseType: "json",
        data: payload.data
      })
      .then(response => callback(response.status, response));
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
