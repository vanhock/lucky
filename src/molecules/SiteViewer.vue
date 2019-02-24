<template>
  <div
    v-if="siteUrl"
    class="site-viewer"
    :class="{
      hidden: !siteUrl || siteUrl === '',
      active: viewActive
    }"
  >
    <iframe
      data-perfect-pixel
      :width="iframeParams.width || '100%'"
      height="99%"
      sandbox="allow-same-origin allow-scripts"
    ></iframe>
  </div>
</template>

<script>
import axios from "axios";
import config from "../config";
import { getErrors } from "../api";
import { getElementOffset } from "../atoms/utils";
import { mapGetters } from "vuex";
import { addClass, removeClass } from "../atoms/utils";
import RecognizeMixin from "../mixins/RecognizeMixin.vue";
export default {
  name: "SiteViewer",
  mixins: [RecognizeMixin],
  mounted() {
    !this.viewerReady && this.$router.push({ name: "home" });
    this.init();
  },
  beforeRouteUpdate(from, to, next) {
    if (!this.viewerReady) {
      next(false);
      this.$router.push({ name: "home" });
    } else {
      next(true);
      this.init();
    }
  },
  data: () => ({
    frameNodes: null
  }),
  computed: {
    ...mapGetters([
      "siteUrl",
      "design",
      "siteUrlProxy",
      "viewerReady",
      "iframeParams"
    ]),
    viewActive() {
      return this.viewerReady && this.$route.name === "view";
    },
    currentFrame() {
      return document.querySelector("iframe[data-perfect-pixel]");
    },
    currentFrameDocument() {
      if (!this.currentFrame) {
        return;
      }
      return this.currentFrame.contentWindow.document;
    },
    currentFrameBody() {
      return this.currentFrameDocument.body;
    }
  },
  methods: {
    getErrorsFromApi() {
      const self = this;
      const requiredParams = [
        "clientWidth",
        "clientHeight",
        "offsetLeft",
        "offsetTop"
      ];
      this.frameNodes = this.currentFrameBody.getElementsByTagName("*");
      const resNodes = [...this.frameNodes].filter(item => {
        return requiredParams.every(p => item[p]);
      });

      this.testPage(this.design, resNodes);
      this.errorTipEffects();
      /*getErrors(this.design, resNodes, errors => {
        if (!errors || !Array.isArray(errors.data)) {
          return;
        }
        self.$store.dispatch("setErrors", errors.data);
        this.displayErrors(errors.data);
      });*/
    },
    displayErrors(errors) {
      errors.forEach(error => {
        this.displayErrorTip(error.node, error.errors);
      });
    },
    displayErrorTip(node, errors) {
      if (!node || !errors || !errors.length) {
        return;
      }
      const self = this;
      const left = node.offsetLeft + node.clientWidth / 2;
      const top = node.offsetTop + node.clientHeight - 7;
      const point = this.currentFrameDocument.createElement("div");
      const renderErrors = () => {
        let errorsHtml = "";
        errors.forEach(error => {
          errorsHtml += `
          <li>
            <b class="title">${error.name}: </b>
            <span class="node">${error.nodeValue}px</span>
            <span class="design">${error.designValue}px</span>
          </li>`;
        });
        return errorsHtml;
      };
      point.setAttribute("class", "lky-error-tip");
      point.setAttribute("style", `left: ${left}px; top: ${top}px`);
      point.innerHTML = `
      <div class="lky-point"></div>
        <div class="lky-popup">
          ${
            this.text.errorsFound
          }: <ul class="lky-errors">${renderErrors()}</ul>
        </div>
      </div>`;
      this.currentFrameBody.appendChild(point);
      const pointElem = point.querySelector(".lky-point");
      pointElem.onmouseenter = () => {
        addClass(point, "active");
        self.elementHighlight(node);
      };
      pointElem.onmouseleave = () => {
        removeClass(point, "active");
        self.removeHighlight();
      };
      this.setTipPopupPosition(node, point);
    },
    errorTipEffects() {
      const allTips = this.currentFrameBody.querySelectorAll(".lky-error-tip");
      allTips.forEach(t => {
        t.querySelector(".lky-point").onmouseover = () => {
          allTips.forEach(c => {
            addClass(c, "hover");
          });
        };
        t.onmouseleave = () => {
          allTips.forEach(c => {
            removeClass(c, "hover");
          });
        };
      });
    },
    setTipPopupPosition(node, tip) {
      const popup = tip.querySelector(".lky-popup");
      const gutter = 30;
      const documentDim = {
        width: this.iframeParams.width,
        height: window.innerHeight
      };
      const nodeDim = {
        width: node.clientWidth,
        height: node.clientHeight,
        ...getElementOffset(node, this.currentFrame.contentWindow)
      };
      const popupDim = {
        width: popup.clientWidth,
        height: popup.clientHeight
      };
      const right = () => {
        return (
          documentDim.width - nodeDim.width + nodeDim.left + gutter >=
          popupDim.width
        );
      };
      const bottom = () => {
        return (
          documentDim.height - nodeDim.height + nodeDim.top + gutter >=
          popupDim.height
        );
      };
      const left = () => {
        return nodeDim.left + gutter >= popupDim.width;
      };

      const top = () => {
        return nodeDim.top + gutter >= popupDim.height;
      };

      const halfTop = () => {
        return nodeDim.top + nodeDim.height / 2 >= popupDim.height / 2;
      };
      const halfBottom = () => {
        return (
          documentDim.height - (nodeDim.top + nodeDim.height / 2) >=
          popupDim.height / 2
        );
      };
      const halfLeft = () => {
        return nodeDim.left + nodeDim.width / 2 >= popupDim.width / 2;
      };
      const halfRight = () => {
        return (
          documentDim.width - (nodeDim.left + nodeDim.width / 2) >=
          popupDim.width / 2
        );
      };

      const rightCenter = () => {
        return right() && halfBottom() && halfTop();
      };
      const leftCenter = () => {
        return left() && halfBottom() && halfTop();
      };
      const topCenter = () => {
        return top() && halfLeft() && halfRight();
      };
      const bottomCenter = () => {
        return bottom() && halfLeft() && halfRight();
      };

      //BottomCenter as default
      tip.style.top = nodeDim.top + nodeDim.height + "px";
      tip.style.left = nodeDim.left + nodeDim.width / 2 + "px";
      if (rightCenter()) {
        tip.style.top =
          nodeDim.top + nodeDim.height / 2 - nodeDim.height / 2 + "px";
        tip.style.left = nodeDim.left + nodeDim.width + "px";
        addClass(popup, "right");
      } else if (bottomCenter()) {
        addClass(popup, "bottom");
      } else if (leftCenter()) {
        tip.style.top =
          nodeDim.top + nodeDim.height / 2 - nodeDim.height / 2 + "px";
        tip.style.left = nodeDim.left + "px";
        addClass(popup, "left");
      } else if (topCenter()) {
        tip.style.top = nodeDim.top + "px";
        tip.style.left =
          nodeDim.left + nodeDim.width / 2 - popupDim.width / 2 + "px";
        addClass(popup, "top");
      } else {
        addClass(tip, "no-popup");
        addClass(popup, "bottom");
      }
      popup.style.position = "absolute";
    },
    elementHighlight(node) {
      if (!node) {
        return;
      }
      const styles = node.getBoundingClientRect();
      let div = this.currentFrameDocument.createElement("div");
      div.className = "node-highlight";
      div.style.position = "fixed";
      div.style.content = "";
      div.style.height = `${styles.height + "px"}`;
      div.style.width = `${styles.width + "px"}`;
      div.style.top = `${styles.top + "px"}`;
      div.style.right = `${styles.right + "px"}`;
      div.style.bottom = `${styles.bottom + "px"}`;
      div.style.left = `${styles.left + "px"}`;
      div.style.background = "#05f";
      div.style.opacity = "0.25";
      this.currentFrameBody.appendChild(div);
    },
    removeHighlight() {
      const elems = this.currentFrameDocument.getElementsByClassName(
        "node-highlight"
      );
      for (let elm of elems) {
        this.currentFrameBody.removeChild(elm);
      }
    },
    init() {
      const self = this;
      this.initIframe().then(() => {
        const frameDocument = document.querySelector(
          "iframe[data-perfect-pixel]"
        ).contentWindow.document;
        frameDocument.onreadystatechange = () => {
          if (frameDocument.readyState !== "complete") {
            return;
          }
          self.getErrorsFromApi();
        };
      });
    },
    initIframe() {
      const url = this.siteUrl;
      const self = this;
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          const iframe = document.getElementsByTagName("iframe")[0];
          const loadHTML = function(html) {
            iframe.src = "about:blank";
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(
              html.replace(/<head>/i, `<head><base href="${url}">`)
            );

            iframe.contentWindow.document.close();
            iframe.contentWindow.document.head.prepend(
              self.renderStyles(iframe.contentWindow.document)
            );
            setTimeout(() => {
              const frames = iframe.contentWindow.document.querySelectorAll(
                "iframe"
              );
              for (let i = 0; i < frames.length; i++) {
                frames[i].remove();
              }
              const links = iframe.contentWindow.document.querySelectorAll(
                "*:not(iframe)"
              );
              for (let i = 0; i < links.length; i++) {
                if (links[i].tagName === "BASE") continue;
                links[i].href && replaceUrl(rel_to_abs(links[i].href));
                links[i].src && replaceUrl(rel_to_abs(links[i].src));
              }

              function replaceUrl(oldUrl) {
                return oldUrl.replace(url, `${config.serverUrl}/proxy/${url}`);
              }

              function rel_to_abs(url) {
                if (
                  /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(
                    url
                  )
                )
                  return url; //Url is already absolute

                const base_url =
                  `${config.serverUrl}/proxy/${url}`.match(
                    /^(.+)\/?(?:#.+)?$/
                  )[0] + "/";
                if (url.substring(0, 2) == "//") return location.protocol + url;
                else if (url.charAt(0) == "/")
                  return location.protocol + "//" + location.host + url;
                else if (url.substring(0, 2) == "./") url = "." + url;
                else if (/^\s*$/.test(url)) return "";
                //Empty = Return nothing
                else url = "../" + url;

                url = base_url + url;
                while (
                  /\/\.\.\//.test((url = url.replace(/[^\/]+\/+\.\.\//g, "")))
                );

                /* Escape certain characters to prevent XSS */
                url = url
                  .replace(/\.$/, "")
                  .replace(/\/\./g, "")
                  .replace(/"/g, "%22")
                  .replace(/'/g, "%27")
                  .replace(/</g, "%3C")
                  .replace(/>/g, "%3E");
                return url;
              }
            }, 100);
          };

          axios
            .get(`${config.serverUrl}/proxy/${url}`)
            .then(r => {
              loadHTML(r.data);
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        });
      });
    },
    renderStyles(d) {
      const css = `.lky-error-tip {
       position: absolute;
       z-index: 999999;
      }
      .lky-error-tip .lky-point {
        position: absolute;
        width: 25px;
        height: 25px;
        background-color: red;
        border: 4px solid #fff;
        border-radius: 50%;
        z-index: 999;
      }
      .lky-error-tip .lky-popup {
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
        visibility: hidden;
        z-index: 99999999;
        box-shadow: 0 2px 170px rgba(0, 0, 0, 0.5);
      }
      .lky-popup.left, .lky-popup.right, .lky-popup.top, .lky-popup.bottom  {
        position: absolute
      }
      .lky-popup.left {
        right: calc(100% + 30px);
        top: 50%;
        transform: translate(0, -50%);
      }
      .lky-popup.right {
        left: calc(100% + 30px);
        top: 50%;
        transform: translate(0, -50%);
      }
      .lky-popup.top {
        bottom: calc(100% + 30px);
        left: 50%;
        transform: translate(-50%, 0);
      }
      .lky-popup.bottom {
        top: calc(100% + 30px);
        left: 50%;
        transform: translate(-50%, 0);
      }
      .lky-error-tip.active .lky-popup {
        visibility: visible;
        width: 250px;
        height: auto;
      }
      .lky-error-tip.hover .lky-point {
        z-index: 2;
        opacity: 0;
      }
      .lky-error-tip .lky-popup .title {
        color: #404241;
        font-size: 11px;
        display: block;
      }
      .lky-error-tip .lky-popup .node {
        color: red;
      }
      .lky-error-tip .lky-popup .design {
        color: green;
      }
      .node-highlight {
        z-index: 9999;
      }`;
      const style = d.createElement("style");
      if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(d.createTextNode(css));
      }
      return style;
    }
  }
};
</script>

<style lang="scss">
.site-viewer {
  overflow-x: hidden;
  transition: opacity 1s 2s linear;
  &.hidden {
    opacity: 0;
  }
  &:not(.active) {
    &:before {
      content: "";
      position: absolute;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 1;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }
  }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #fff;
    z-index: -1;
  }
}
.node-highlight {
  z-index: 100;
}
</style>
