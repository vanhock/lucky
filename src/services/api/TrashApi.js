import PixelApi from "./api";
import { generalCallback } from "./helpers";

export function getProjectsTrash(cb) {
  PixelApi.get("/get-projects-trash", (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function restoreProject(payload, cb) {
  PixelApi.post("/restore-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function deleteProject(payload, cb) {
  PixelApi.post("/delete-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}
