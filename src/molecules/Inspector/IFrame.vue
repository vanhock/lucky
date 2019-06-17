<script>
import Vue from "vue";
import { downloadProjectResources } from "../../services/api/ProjectApi";
import { INSPECTOR_SET_TOOL } from "../../services/store/mutation-types";
import {
  INSPECTOR_STATE_INSPECTING,
  INSPECTOR_TOOL_DOM_INSPECTOR
} from "../../services/store/InspectorsStoreModule";
import { extractHostname, getUrlDomain } from "../../utils";
import { mapGetters } from "vuex";
import config from "../../config";
export default {
  name: "IFrame",
  render(h) {
    return h("iframe", {
      attrs: {
        "data-perfect-pixel": true,
        src: this.currentUrl,
        width: this.width,
        height: this.height,
        sandbox: "allow-same-origin allow-scripts"
      },
      ref: "perfectFrame",
      on: { load: this.initFrame }
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
    slotRendered: false,
    stylesRendered: false,
    proxyMode: false
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
    ...mapGetters(["currentProject"])
  },
  methods: {
    initFrame() {
      console.log("I`m a frame");
      this.applyProxyForLinks();
      /*this.renderStyles();
      this.renderSlot();
      this.onFrameUpdate();*/
      this.$emit("stateChanged", "complete");
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
    },
    setMode() {
      this.proxyMode =
        extractHostname(this.src) !== extractHostname(location.href);
    },
    applyProxyForLinks() {
      const hrefArray = [];
      const scripts = this.$el.contentDocument.querySelectorAll("script");
      const links = this.$el.contentDocument.querySelectorAll(
        "link[rel='stylesheet']"
      );
      const proxyPath = `${config.projectsFolderUrl}/${
        this.currentProject.permalink
      }/static/`;
      scripts.forEach(s => {
        const src = s.getAttribute("src");
        if (src && src !== "") {
          s.setAttribute("src", src.replace(getUrlDomain(src), proxyPath));
          hrefArray.push(src);
        }
      });
      links.forEach(l => {
        const href = l.getAttribute("href");
        if (href && href !== "") {
          l.setAttribute("href", href.replace(getUrlDomain(href), proxyPath));
          hrefArray.push(href);
        }
      });
      if (!hrefArray.length) {
        return;
      }
      downloadProjectResources(
        {
          folder: this.currentProject.permalink,
          links: JSON.stringify(hrefArray)
        },
        error => {
          if (error) {
            return console.log(`Error with download: ${error}`);
          }
          console.log("Resources downloaded successfully");
        }
      );
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
