<script>
import Vue from "vue";
import { INSPECTOR_SET_TOOL } from "../../services/store/mutation-types";
import {
  INSPECTOR_STATE_INSPECTING,
  INSPECTOR_TOOL_DOM_INSPECTOR
} from "../../services/store/InspectorsStoreModule";
import { extractHostname } from "../../utils";
import { mapGetters } from "vuex";
import config from "../../config";
export default {
  name: "IFrame",
  render(h) {
    return h("iframe", {
      attrs: {
        src: this.src,
        "data-perfect-pixel": true,
        width: this.width,
        height: "100%",
        charset: "utf-8",
        sandbox: "allow-same-origin allow-scripts allow-forms"
      },
      ref: "perfectFrame",
      on: { load: this.onFrameLoad }
    });
  },
  created() {
    this.$emit("stateChanged", "loading");
    this.setMode();
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === INSPECTOR_SET_TOOL) {
        if (
          mutation.payload === INSPECTOR_TOOL_DOM_INSPECTOR &&
          state.inspectors.state === INSPECTOR_STATE_INSPECTING
        ) {
          this.$emit("stateChanged", "loading");
          this.preventLinks();
          this.onFrameUpdate();
        } else {
          this.restoreLinks();
        }
      }
    });
  },
  beforeUpdate() {
    if (!this.frameApp || !this.frameApp.children) return;
    this.frameApp.children = Object.freeze(this.$slots.default);
    this.$emit("stateChanged", this.$el.contentDocument.readyState);
  },
  data: () => ({
    urlLoaded: false,
    slotRendered: false,
    stylesRendered: false,
    proxyMode: false,
    ajaxSession: null
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
  computed: {
    currentUrl() {
      return this.proxyMode ? `${config.proxyUrl}/${this.src}` : this.src;
    },
    ...mapGetters(["currentProject", "currentPage"]),
    frameDocument() {
      return this.$el && this.$el.contentDocument;
    },
    frameWindow() {
      return this.$el.contentWindow;
    }
  },
  methods: {
    onFrameLoad() {
      if (!this.frameDocument) {
        return;
      }
      this.$emit("stateChanged", "complete");
      this.renderStyles();
      this.renderSlot();
      this.preventLinks();
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
      if (!this.stylesRendered && this.frameStyles !== "") {
        const d = this.$el.contentDocument;
        const style = d.createElement("style");
        if (style.styleSheet) {
          // This is required for IE8 and below.
          style.styleSheet.cssText = this.frameStyles;
        } else {
          style.appendChild(d.createTextNode(this.frameStyles));
        }
        this.$el.contentDocument.head.appendChild(style);
        this.stylesRendered = true;
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
        const old_element = anchors[i];
        const new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
        new_element.onclick = () => {
          return false;
        };
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
    },
    setMode() {
      this.proxyMode =
        extractHostname(this.src) !== extractHostname(location.href);
    },
    applyProxyForLinks() {
      const links = this.$el.contentDocument.querySelectorAll(
        "script, link[rel='stylesheet']"
      );
      const proxyPath = `${config.projectsFolderUrl}/${
        this.currentProject.permalink
      }/static/`;
      links.forEach(l => {
        const attrs = {
          href: l.getAttribute("href"),
          src: l.getAttribute("src")
        };
        for (let key in attrs) {
          if (attrs.hasOwnProperty(key) && attrs[key]) {
            const domain = extractHostname(this.currentProject.url);
            l.setAttribute(
              key,
              proxyPath +
                attrs[key]
                  .replace(/^\/(?!\/)/i, `${domain}/`)
                  .replace(/(?:(?!\/\/).)*\/\//i, "")
            );
          }
        }
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
