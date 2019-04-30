export function generalCallback(status, data, cb) {
  if (status !== 200) {
    return cb(data);
  }
  cb(null, data);
}
