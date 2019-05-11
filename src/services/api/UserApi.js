import PixelApi from "./api";
import { generalCallback } from "./helpers";

export function Registration(payload, cb) {
  PixelApi.post("/registration", { data: payload }, (status, data) => {
    if (status !== 200) {
      return cb(data);
    }
    cb(null, data);
  });
}

export function Authorization(payload, cb) {
  PixelApi.post("/authorization", { data: payload }, (status, data) => {
    if (status !== 200) {
      return cb(data);
    }
    cb(null, data);
  });
}

export function AuthByToken(cb) {
  PixelApi.get("/auth-by-token", (status, data) => {
    console.log("auth response" + data);
    generalCallback(status, data, cb);
  });
}
