<script>
import Vue from "vue";
import { INSPECTOR_SET_STATE } from "../../services/store/mutation-types";
import { INSPECTOR_STATE_CREATING } from "../../services/store/InspectorsStoreModule";
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
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === INSPECTOR_SET_STATE) {
        if (mutation.payload === INSPECTOR_STATE_CREATING) {
          this.onFrameUpdate();
          this.renderSlot();
          this.preventLinks();
        } else {
          this.restoreLinks();
        }
      }
    });
  },
  data: () => ({
    slotRendered: false
  }),
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
    if (!this.frameApp || !this.frameApp.children) return;
    this.frameApp.children = Object.freeze(this.$slots.default);
  },
  methods: {
    initFrame() {
      console.log("I`m a frame");
      this.renderStyles();
      this.onFrameUpdate();
    },
    renderSlot() {
      if (this.slotRendered) {
        return console.log("Frame slot already rendered!");
      }
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
      this.slotRendered = true;
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
    preventLinks() {
      const anchors = this.$el.contentDocument.getElementsByTagName("a");
      for (let i = 0; i < anchors.length; i++) {
        anchors[i].setAttribute(
          "data-pp-href",
          anchors[i].getAttribute("href")
        );
        anchors[i].removeAttribute("href");
        /*const old_element = anchors[i];
        const new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
        new_element.onclick = () => {
          return false;
        };*/
      }
    },
    restoreLinks() {
      const anchors = this.$el.contentDocument.getElementsByTagName("a");
      for (let i = 0; i < anchors.length; i++) {
        anchors[i].setAttribute(
          "href",
          anchors[i].getAttribute("data-pp-href")
        );
        anchors[i].removeAttribute("data-pp-href");
      }
    },
    onFrameUpdate() {
      const frameElements = this.$el.contentDocument.body.getElementsByTagName(
        "*"
      );
      this.$emit("update", {
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
