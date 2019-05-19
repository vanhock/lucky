import PixelApi from "./api";
import { generalCallback } from "./helpers";
import { serializeObject } from "../../utils";

export function createTask(payload, cb) {
  PixelApi.post("/create-task", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function editTask(payload, cb) {
  PixelApi.post("/edit-task", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function getAllTasks(payload, cb) {
  PixelApi.get(`/get-all-tasks?${payload}`, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function moveTaskToTrash(payload, cb) {
  PixelApi.post("/move-task-to-trash", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}
