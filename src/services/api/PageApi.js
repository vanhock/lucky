import PixelApi from "./api";
import { generalCallback } from "./helpers";

export function getAllPages(payload, cb) {
  PixelApi.get(`/get-all-pages?projectId=${payload}`, (status, pages) => {
    generalCallback(status, pages, cb);
  });
}

export function createPage(payload, cb) {
  PixelApi.post("/create-page", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function editPage(payload, cb) {
  PixelApi.post("/set-page-params", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}

export function movePageToTrash(payload, cb) {
  PixelApi.post("/move-page-to-trash", { data: payload }, (status, data) => {
    generalCallback(status, data, cb);
  });
}
