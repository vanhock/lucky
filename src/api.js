import axios from "axios";
import config from "./config";

export function getErrors(design, nodes, cb) {
  const options = {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  };

  const formData = new FormData();
  formData.append("design", JSON.stringify(design));
  formData.append("nodes", JSON.stringify(nodes));
  axios
    .post(config.serverUrl + "/get-errors", formData, options)
    .then(errors => {
      cb(errors);
    });
}

export function getTargetView(url, cb) {
  axios.get(config.serverUrl + "/get-target-view" + "?url=" + url).then(res => {
    const html = res.data;
    cb(html);
  });
}

function stringif(array) {}
