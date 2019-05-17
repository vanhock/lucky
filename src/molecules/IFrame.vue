<script>
import Vue from "vue";
export default {
  name: "IFrame",
  render(h) {
    return h("iframe", {
      attrs: {
        src: this.src,
        width: this.width,
        height: this.height,
        sandbox: "allow-same-origin allow-scripts"
      },
      on: { load: this.initFrame }
    });
  },
  props: {
    src: {
      type: String,
      required: true
    },
    width: String,
    height: String
  },
  beforeUpdate() {
    this.frameApp.children = Object.freeze(this.$slots.default);
  },
  methods: {
    initFrame() {
      this.preventAllLinks();
      this.renderSlot();
    },
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
    },
    preventAllLinks() {
      const anchors = this.$el.contentDocument.getElementsByTagName("a");
      for (let i = 0; i < anchors.length; i++) {
        anchors[i].removeAttribute("href");
        const old_element = anchors[i];
        const new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
        new_element.onclick = () => {
          return false;
        };
      }
    }
  }
};
</script>
