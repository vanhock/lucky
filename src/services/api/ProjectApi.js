import PixelApi from "./api";
import { generalCallback } from "./helpers";
import { serializeObject } from "../../utils";

export function createProject(payload, cb) {
  PixelApi.post("/create-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function projectSetScreenshot(payload, cb) {
  PixelApi.post(
    "/project-set-screenshot",
    { data: payload },
    (status, data) => {
      generalCallback(status, data, cb);
    }
  );
}

export function editProject(payload, cb) {
  PixelApi.post("/edit-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function getAllProjects(payload, cb) {
  PixelApi.get(`/get-all-projects?${payload}`, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function getProject(payload, cb) {
  PixelApi.get(`/get-project?${payload}`, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function moveProjectToTrash(payload, cb) {
  PixelApi.post("/move-project-to-trash", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function checkAccessToProject(payload, cb) {
  PixelApi.get(`/check-access-to-project?${payload}`, (status, data) => {
    generalCallback(status, data, cb);
  });
}
