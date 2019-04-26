import axios from "axios";
import config from "../config";

export function getFoundNodesFromApi(design, nodes, cb) {
  const options = {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  };

  const formData = new FormData();
  formData.append("design", JSON.stringify(design));
  formData.append("nodes", JSON.stringify(nodes));
  axios
    .post(config.serverUrl + "/get-found-nodes", formData, options)
    .then(response => {
      const foundNodes = response.data;
      cb(foundNodes);
    });
}