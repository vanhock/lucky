import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["viewParams"])
  },
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
    },
    setViewParam(name, value) {
      if (!name) {
        return;
      }
      const param = {};
      param[name] = value;
      this.$store.dispatch("INSPECTOR_SET_VIEW_PARAMS", param);
    }
  }
};
