import { normalizeDate } from "../utils";
import Vue from "vue";
export default () => {
  Vue.filter("truncate", (value, length) => {
    return value && value.length > length
      ? `${value.substring(0, length)}...`
      : value;
  });

  Vue.filter("normalizeDate", value => {
    return normalizeDate(value);
  });
};
