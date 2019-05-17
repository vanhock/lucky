<script>
import Vue from "vue";
export default {
  name: "IFrame",
  render(h) {
    return h("iframe", {
      on: { load: this.renderSlot }
    });
  },
  beforeUpdate() {
    this.frameApp.children = Object.freeze(this.$slots.default);
  },
  methods: {
    renderSlot() {
      const children = this.$slots.default;
      const body = this.$el.contentDocument.body;
      const el = document.createElement("DIV");
      body.appendChild(el);
      const frameApp = new Vue({
        name: "frameApp",
        data: { children: Object.freeze(children) },
        render(h) {
          return h("div", this.children);
        }
      });
      frameApp.$mount(el);
      this.frameApp = frameApp;
    }
  }
};
</script>

<style scoped></style>
