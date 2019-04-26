import axios from "axios";
import config from "../config";

export const pixelApi = axios.create({
  baseURL: "https://api.figma.com/v1",
  headers: {
    authorization: ""
  }
});
