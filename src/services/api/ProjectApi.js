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

export function getProject(payload, cb) {
  PixelApi.get(`/get-project?id=${payload}`, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function moveProjectToTrash(payload, cb) {
  PixelApi.post("/move-project-to-trash", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}
