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

export function getPagesTrash(cb) {
  PixelApi.get("/get-pages-trash", (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function restorePage(payload, cb) {
  PixelApi.post("/restore-page", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function deletePage(payload, cb) {
  PixelApi.post("/delete-page", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

