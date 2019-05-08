export default {
  serverUrl: "",
  apiUrl:
    (process.env.NODE_ENV === "development" && "http://localhost:3000") ||
    "https://perfectpixel.io"
};
