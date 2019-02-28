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
      :width="frameParams.width || '100%'"
      :height="windowDim.height - 54 + 'px'"
      sandbox="allow-same-origin allow-scripts"
    ></iframe>
  </div>
</template>

<script>
import axios from "axios";
import config from "../config";
import { getFromLocal, addToLocal } from "../atoms/utils";
import { mapGetters } from "vuex";
import {
  addClass,
  removeClass,
  getElementOffset,
  relToAbs
} from "../atoms/utils";
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
      "frameParams",
      "foundNodes",
      "isFoundNodes",
      "currentProject"
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
    },
    windowDim() {
      return { width: window.innerWidth, height: window.innerHeight };
    }
  },
  methods: {
    init() {
      const self = this;
      this.initFrame().then(() => {
        const frameDocument = document.querySelector(
          "iframe[data-perfect-pixel]"
        ).contentWindow.document;
        frameDocument.onreadystatechange = () => {
          if (frameDocument.readyState !== "complete") {
            return;
          }
          self.applyFrameAdditionalStyles();
          self.preventAllLinks(self.currentFrameDocument);
          self.initTestPage();
        };
      });
    },
    initTestPage() {
      const requiredParams = [
        "clientWidth",
        "clientHeight",
        "offsetLeft",
        "offsetTop"
      ];
      this.frameNodes = this.currentFrameBody.getElementsByTagName("*");
      const resultNodes = [...this.frameNodes].filter(item => {
        return requiredParams.every(p => item[p]);
      });
      if (this.isFoundNodes) {
        this.processNodes(this.frameNodes, this.foundNodes);
      } else {
        // Will be process in backend =>
        this.testNodes(this.design, resultNodes).then(foundNodes => {
          if (
            !foundNodes ||
            typeof foundNodes !== "object" ||
            !Object.entries(foundNodes).length
          ) {
            return;
          }
          this.processNodes(this.frameNodes, foundNodes);

          this.$store
            .dispatch("setFoundNodes", foundNodes)
            .then(currentProject => {
              this.saveProjectToLocal(currentProject);
            });
        });
      }
    },
    saveProjectToLocal(currentProject) {
      addToLocal("recentProjects", currentProject.id, currentProject);
    },
    processNodes(frameNodes, foundNodes) {
      const self = this;
      const nodes = [...frameNodes];
      nodes.forEach((node, index) => {
        if (foundNodes.hasOwnProperty(index)) {
          self.processFoundNode(node, foundNodes[index]);
        }
      });
      this.errorTipEffects();
    },
    processFoundNode(node, foundNode) {
      if (!node || !foundNode) {
        return;
      }
      this.renderIssueTip(node, foundNode, this.currentFrameDocument);
      this.addElementHighlight(node);
    },
    renderIssueTip(node, foundNode, frameDocument) {
      const self = this;
      const left = node.offsetLeft + node.clientWidth / 2;
      const top = node.offsetTop + node.clientHeight - 7;
      const point = frameDocument.createElement("div");
      const renderIssues = () => {
        let issueHtml = "";
        foundNode.issues.forEach(issue => {
          issueHtml += `
          <li>
            <b class="title">${issue.name}: </b>
            <span class="node">${issue.nodeValue}px</span>
            <span class="design">${issue.designValue}px</span>
          </li>`;
        });
        return issueHtml;
      };
      point.setAttribute("class", "lky-error-tip");
      point.setAttribute("style", `left: ${left}px; top: ${top}px`);
      point.innerHTML = `
      <div class="lky-point" style="pointer-events: auto !important;"></div>
        <div class="lky-popup">
          ${
            this.text.errorsFound
          }: <ul class="lky-errors">${renderIssues()}</ul>
        </div>
      </div>`;
      this.currentFrameBody.appendChild(point);
      this.setTipPopupPosition(node, point);

      const pointElem = point.querySelector(".lky-point");
      pointElem.onmouseenter = () => {
        addClass(point, "active");
        self.addElementOverlay(node);
      };
      pointElem.onclick = () => {
        addClass(point, "active");
        self.addElementOverlay(node);
      };
      pointElem.onmouseleave = () => {
        removeClass(point, "active");
        self.removeOverlayForAll();
      };
    },
    addElementHighlight(node) {
      if (!node) {
        return;
      }
      addClass(node, "lky-hover");
    },
    addElementOverlay(node) {
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
    removeOverlayForAll() {
      const elems = this.currentFrameDocument.getElementsByClassName(
        "node-highlight"
      );
      for (let elm of elems) {
        this.currentFrameBody.removeChild(elm);
      }
    },
    errorTipEffects() {
      const allTips = this.currentFrameBody.querySelectorAll(".lky-error-tip");
      const self = this;
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
      this.currentFrameBody.onclick = () => {
        self.removeHighlight();
        allTips.forEach(c => {
          removeClass(c, "active");
          removeClass(c, "hover");
        });
      };
    },
    setTipPopupPosition(node, tip) {
      const popup = tip.querySelector(".lky-popup");
      const gutter = 30;
      const documentDim = {
        width: this.frameParams.width,
        height: this.currentFrameBody.clientHeight
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
          documentDim.width - (nodeDim.width + nodeDim.left + gutter) >=
          popupDim.width
        );
      };
      const bottom = () => {
        return (
          documentDim.height - (nodeDim.height + nodeDim.top + gutter) >=
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
        tip.style.top = nodeDim.top - gutter + "px";
        tip.style.left = nodeDim.left + nodeDim.width / 2 + "px";
        addClass(popup, "top");
      } else {
        addClass(tip, "no-popup");
        addClass(popup, "bottom");
      }
      popup.style.position = "absolute";
    },
    initFrame() {
      const url = this.siteUrl;
      const self = this;
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          const frame = document.getElementsByTagName("iframe")[0];
          const loadHTML = function(html) {
            frame.src = "about:blank";
            frame.contentWindow.document.open();
            frame.contentWindow.document.write(
              html.replace(/<head>/i, `<head><base href="${url}">`)
            );

            frame.contentWindow.document.close();
            frame.contentWindow.document.head.prepend(
              self.renderStyles(frame.contentWindow.document)
            );
            setTimeout(() => {
              const frames = frame.contentWindow.document.querySelectorAll(
                "iframe"
              );
              for (let i = 0; i < frames.length; i++) {
                frames[i].remove();
              }
              const links = frame.contentWindow.document.querySelectorAll(
                "*:not(iframe)"
              );
              for (let i = 0; i < links.length; i++) {
                if (links[i].tagName === "BASE") continue;
                links[i].href &&
                  replaceUrl(relToAbs(links[i].href, config.serverUrl));
                links[i].src &&
                  replaceUrl(relToAbs(links[i].src, config.serverUrl));
              }
              function replaceUrl(oldUrl) {
                return oldUrl.replace(url, `${config.serverUrl}/proxy/${url}`);
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
      .lky-popup:before {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
      }
      .lky-popup.top:before {
        bottom: -5px;
        left: 50%;
        transform: translate(-50%, 0);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #fff;

      }
      .lky-popup.bottom:before {
        top: -5px;
        left: 50%;
        transform: translate(-50%, 0);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 5px solid #fff;
      }
      .lky-popup.left:before {
      top: 50%;
        right: -5px;
        transform: translate(0, -50%);
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 5px solid #fff;
      }
      .lky-popup.right:before {
        top: 50%;
        left: -5px;
        transform: translate(0, -50%);
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-right: 5px solid #fff;
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
    },
    applyFrameAdditionalStyles() {
      this.currentFrameBody.style.setProperty(
        "overflow-x",
        "hidden",
        "important"
      );
    },
    preventAllLinks(frameDocument) {
      const anchors = frameDocument.getElementsByTagName("a");
      for (let i = 0; i < anchors.length; i++) {
        anchors[i].onclick = () => {
          return false;
        };
      }
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
    background-color: #fff;
    border: 0;
  }
}
.node-highlight {
  z-index: 100;
}
</style>
