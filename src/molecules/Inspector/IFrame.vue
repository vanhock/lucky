<script>
import Vue from "vue";
export default {
  name: "IFrame",
  render(h) {
    return h("iframe", {
      attrs: {
        "data-perfect-pixel": true,
        src: this.src,
        width: this.width,
        height: this.height,
        sandbox: "allow-same-origin allow-scripts"
      },
      ref: "perfectFrame",
      on: { load: this.initFrame }
    });
  },
  props: {
    src: {
      type: String,
      required: true
    },
    width: String,
    height: String,
    frameStyles: {
      type: String,
      default: ""
    }
  },
  beforeUpdate() {
    this.frameApp.children = Object.freeze(this.$slots.default);
  },
  methods: {
    initFrame() {
      console.log("I`m a frame");
      this.preventAllLinks();
      this.renderSlot();
      this.renderStyles();
      this.onLoad();
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
    renderStyles() {
      if (this.frameStyles !== "") {
        const d = this.$el.contentDocument;
        const style = d.createElement("style");
        if (style.styleSheet) {
          // This is required for IE8 and below.
          style.styleSheet.cssText = this.frameStyles;
        } else {
          style.appendChild(d.createTextNode(this.frameStyles));
        }
        this.$el.contentDocument.head.appendChild(style);
      }
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
    },
    onLoad() {
      const frameElements = this.$el.contentDocument.body.getElementsByTagName(
        "*"
      );
      this.$emit("load", {
        frameNodes: [...frameElements],
        frameWindow: this.$el.contentWindow
      });
    }
  }
};
</script>
<style lang="scss">
iframe[data-perfect-pixel] {
  background-color: #fff;
  border: 0 !important;
}
</style>