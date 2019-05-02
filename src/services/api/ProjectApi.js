import PixelApi from "./api";
import { generalCallback } from "./helpers";

export function createProject(payload, cb) {
  PixelApi.post("/create-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function editProject(payload, cb) {
  PixelApi.post("/edit-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function getAllProjects(cb) {
  PixelApi.get("/get-all-projects", (status, data) => {
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
