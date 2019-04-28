import PixelApi from "./api";
export function Registration(payload, cb) {
  PixelApi.post("/registration", { data: payload }, (status, data) => {
    if (status !== 200) {
      return cb(data);
    }
    cb(null, data);
  });
}

export function Authorization(payload, cb) {
  PixelApi.get(
    `/authorization?email=${payload.email}&password=${payload.password}`,
    { data: "" },
    (status, data) => {
      if (status !== 200) {
        return cb(data);
      }
      localStorage.setItem("authorization", data.token);
      cb(null, data);
    }
  );
}
