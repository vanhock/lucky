import PixelApi from "./api";
import { generalCallback } from "./helpers";

export function getProjectsTrash(cb) {
  PixelApi.get("/get-projects-trash", (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function moveProjectToTrash(payload, cb) {
  PixelApi.post("/move-project-to-trash", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function deleteProject(payload, cb) {
  PixelApi.post("/delete-project", (status, data) => {
    generalCallback(status, data, cb);
  });
}
