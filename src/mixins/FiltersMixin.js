export default {
  filters: {
    truncate(value, length) {
      return value && value.length > length
        ? `${value.substring(0, length)}...`
        : value;
    }
  }
};
