import PixelApi from "./api";
export function Registration(payload, cb) {
  PixelApi.post("/registration", { data: payload }, (status, message) => {
    if (status !== 200) {
      return cb(status);
    }
    cb(null, message);
  });
}

export function Authorization(payload, cb) {
  PixelApi.get("/authorization", payload, (status, user) => {
    if (status !== 200) {
      return;
    }
    localStorage.setItem("authorization", user.token);
    cb(null, user);
  });
}
