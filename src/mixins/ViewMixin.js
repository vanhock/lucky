export default {
  methods: {
    getViewParam(name) {
      if (!this.viewParams) {
        return;
      }
      return (
        this.viewParams &&
        this.viewParams.hasOwnProperty(name) &&
        this.viewParams[name]
      );
    }
  }
}