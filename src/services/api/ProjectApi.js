import PixelApi from "./api";
import { generalCallback } from "./helpers";

export function createProject(payload, cb) {
  PixelApi.post("/create-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function checkProjectScreenshot(payload, cb) {
  if(!payload) {
    return cb("Not found");
  }
  PixelApi.get(payload, res => {
    if(res === 404 || res.status === 404) {
      return cb("Not found");
    }
    cb(null, "ok!")
  })
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

export function inviteToProject(payload, cb) {
  PixelApi.post("/invite-to-project", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function revokeAccessToProject(payload, cb) {
  PixelApi.post(
    "/revoke-access-to-project",
    { data: payload },
    (status, data) => {
      generalCallback(status, data, cb);
    }
  );
}

export function getProjectUsers(payload, cb) {
  PixelApi.get(`/get-project-users?${payload}`, (status, data) => {
    generalCallback(status, data, cb);
  });
}
