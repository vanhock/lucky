import PixelApi from "./api";
import { generalCallback } from "./helpers";

export function getPages(payload, cb) {
  PixelApi.get(`/get-pages?${payload}`, (status, pages) => {
    generalCallback(status, pages, cb);
  });
}

export function getPage(payload, cb) {
  PixelApi.get(`/get-page?${payload}`, (status, page) => {
    generalCallback(status, page, cb);
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
