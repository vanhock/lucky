<template>
  <div
    v-if="websiteUrl"
    class="site-viewer"
    :class="{
      hidden: !websiteUrl || websiteUrl === '',
      active: viewActive
    }"
  >
    <div class="frame" :style="frameStyles">
      <iframe
        data-perfect-pixel
        :width="frameStyles.width"
        :height="frameStyles.height"
        sandbox="allow-same-origin allow-scripts"
      ></iframe>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "../../config";
import { mapGetters } from "vuex";
import {
  addClass,
  removeClass,
  detectMouseButton,
  getElementBounding,
  relToAbs,
  scrollTo
} from "../../utils";
import ViewMixin from "../../mixins/ViewMixin";
export default {
  name: "WebsiteInspector",
  mixins: [ViewMixin],
  created() {
    this.initFrame();
  },
  data: () => ({
    text: {
      errorsFound: "Обнаружены ошибки",
      width: "Ширина",
      height: "Высота",
      left: "Смещение слева",
      top: "Смещение сверху"
    },
    noScroll: false,
    foundNodesEventHandlers: []
  }),
  computed: {
    ...mapGetters([
      "designBlocks",
      "websiteUrl",
      "websiteUrlProxy",
      "viewerReady",
      "frameParams",
      "foundNodes",
      "isFoundNodes",
      "currentFrame",
      "currentFrameDocument",
      "currentFrameBody",
      "currentFrameWindow",
      "viewParams",
      "targetElement"
    ]),
    viewActive() {
      return this.viewerReady && this.$route.name === "view";
    },
    frameStyles() {
      if (!this.frameParams) {
        return;
      }
      return {
        width: (this.frameParams.width || "100%") + "px",
        height: this.viewParams && this.viewParams.websiteInspectorHeight + "px"
      };
    },
    syncScroll() {
      return this.getViewParam("syncScroll");
    }
  },
  watch: {
    targetElement(element) {
      this.focusOnElement(element);
      this.scrollToTargetElement(element);
    }
  },
  methods: {
    initFrame() {
      const self = this;
      this.$nextTick(() => {
        const frame = document.querySelector("iframe[data-perfect-pixel]");
        axios
          .get(self.websiteUrlProxy)
          .then(r => {
            self.loadFrameHtml(r.data, frame);
            const frameWindow = document.querySelector(
              "iframe[data-perfect-pixel]"
            ).contentWindow;
            const frameDocument = frameWindow.document;
            if (frameDocument.readyState === "complete") {
              setUpFrame();
            }
            frameDocument.onreadystatechange = () => {
              if (frameDocument.readyState !== "complete") {
                return;
              }
              setUpFrame();
            };
            function setUpFrame() {
              self.$store.dispatch(
                "INSPECTOR_SET_CURRENT_FRAME",
                document.querySelector("iframe[data-perfect-pixel]")
              );
              self.preventAllLinks(frameWindow);
              self.applyAdditionalFrameStyles();
              self.$emit("websiteInspectorReady");
              /** If viewParams not set, emmit INSPECTOR_SET_VIEW_PARAMS **/
              if (!self.viewParams) {
                self.$emit("INSPECTOR_SET_VIEW_PARAMS");
              }
              self.currentFrame.contentDocument.onscroll = () => {
                if (!self.syncScroll) {
                  return;
                }
                self.$emit(
                  "websiteScrollTop",
                  frameDocument.scrollingElement.scrollTop
                );
              };
            }
          })
          .catch(error => {
            console.log("Error with getting by proxy: " + error);
          });
      });
    },
    loadFrameHtml(html, frame) {
      const self = this;
      frame.src = "about:blank";
      frame.contentWindow.document.open();
      frame.contentWindow.document.write(
        html.replace(/<head>/i, `<head><base href="${this.websiteUrl}">`)
      );

      frame.contentWindow.document.close();
      frame.contentWindow.document.head.prepend(
        this.renderTipsStyles(frame.contentWindow.document)
      );
      setTimeout(() => {
        const frames = frame.contentWindow.document.querySelectorAll("iframe");
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
          links[i].src && replaceUrl(relToAbs(links[i].src, config.serverUrl));
        }
        function replaceUrl(oldUrl) {
          return oldUrl.replace(
            self.websiteUrl,
            `${config.serverUrl}/proxy/${self.websiteUrl}`
          );
        }
      }, 100);
    },
    processNodes(frameNodes, foundNodes) {
      const self = this;
      for (let key in foundNodes) {
        if (foundNodes.hasOwnProperty(key) && frameNodes[key]) {
          const foundNodeIndex = Object.keys(foundNodes).indexOf(key);
          self.processFoundNode(
            frameNodes[key],
            foundNodes[key],
            foundNodeIndex
          );
        }
      }
      this.attachEvents();
      this.errorTipEffects();
    },
    processFoundNode(frameNode, foundNode, foundNodeIndex) {
      if (!frameNode || !foundNode) {
        return;
      }
      this.renderIssueTip(
        frameNode,
        foundNode,
        this.currentFrameDocument,
        foundNodeIndex
      );
    },
    renderIssueTip(frameNode, foundNode, frameDocument, foundNodeIndex) {
      const left = frameNode.offsetLeft + frameNode.clientWidth / 2;
      const top = frameNode.offsetTop + frameNode.clientHeight - 7;
      const point = frameDocument.createElement("div");
      const renderIssues = () => {
        let issueHtml = "";
        foundNode.issues.forEach(issue => {
          issueHtml += `
          <li>
            <b class="title">${issue.name}: </b>
            <span class="frameNode">${issue.nodeValue}px</span>
            <span class="design">${issue.designValue}px</span>
          </li>`;
        });
        return issueHtml;
      };
      point.setAttribute("class", "pp-found-node-tip");
      point.setAttribute("style", `left: ${left}px; top: ${top}px`);
      point.innerHTML = `
      <div class="pp-point" style="pointer-events: auto !important;"></div>
        <div class="pp-popup">
          ${this.text.errorsFound}: <ul class="pp-errors">${renderIssues()}</ul>
          <div class="pp-popup-close"></div>
        </div>
      </div>`;
      this.currentFrameBody.appendChild(point);
      this.setTipPopupPosition(frameNode, point);
      addClass(frameNode, "pp-element");

      this.addToEventsList(
        point.querySelector(".pp-popup-close"),
        "click",
        () => removeClass(point, "active")
      );
      this.addToEventsList(
        frameNode,
        "click",
        this.onClickOnFoundNode(foundNode, foundNodeIndex)
      );
      this.addToEventsList(frameNode, "mouseenter", this.onNodeEnter);
      this.addToEventsList(frameNode, "mouseleave", this.onNodeLeave);
    },
    addToEventsList(element, listener, func) {
      const self = this;
      self.foundNodesEventHandlers.push({
        element: element,
        listener: listener,
        func: func
      });
    },
    attachEvents() {
      this.foundNodesEventHandlers.forEach(({ element, listener, func }) => {
        element.addEventListener(listener, func);
      });
    },
    detachEvents() {
      this.foundNodesEventHandlers.forEach(({ element, listener, func }) => {
        element.removeEventListener(listener, func);
      });
    },
    onNodeEnter(e) {
      const allTips = this.currentFrameDocument.querySelectorAll(".pp-element");
      if (!allTips) {
        return;
      }
      allTips.forEach(t => {
        removeClass(t, "pp-hover");
      });
      addClass(e.currentTarget, "pp-hover");
    },
    onNodeLeave(e) {
      removeClass(e.currentTarget, "pp-hover");
    },
    onClickOnFoundNode(foundNode, foundNodeIndex) {
      const self = this;
      return function(e) {
        if (!detectMouseButton(e)) {
          return;
        }
        const targetElement = {
          nodeIndex: parseInt(foundNode.id),
          designIndex: parseInt(foundNode.designBlockIndex),
          foundNodeIndex: parseInt(foundNodeIndex)
        };
        self.$store.dispatch("INSPECTOR_SET_TARGET_ELEMENT", targetElement);
        self.focusOnElement(targetElement);
        self.noScroll = true;
        e.stopPropagation();
      };
    },
    focusOnElement(targetElement) {
      if (!targetElement) {
        return;
      }
      const foundElements = this.currentFrameDocument.querySelectorAll(
        ".pp-element"
      );
      const allTips = this.currentFrameBody.querySelectorAll(
        ".pp-found-node-tip"
      );
      this.currentFrameDocument
        .querySelectorAll(".pp-found-node-tip")
        .forEach(el => {
          removeClass(el, "active");
        });
      this.removeOverlayForAll();
      addClass(allTips[targetElement.foundNodeIndex], "active");
      this.addElementOverlay(foundElements[targetElement.foundNodeIndex]);
    },
    addElementOverlay(node) {
      if (!node || !this.currentFrame.contentWindow) {
        return;
      }
      const styles = getElementBounding(node, this.currentFrame.contentWindow);
      let div = this.currentFrameDocument.createElement("div");
      div.className = "node-highlight";
      div.style.position = "absolute";
      div.style.content = "";
      div.style.height = `${styles.height + "px"}`;
      div.style.width = `${styles.width + "px"}`;
      div.style.top = `${styles.top + "px"}`;
      div.style.left = `${styles.left + "px"}`;
      div.style.background = "rgba(0, 85, 255, 0.35)";
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
      const allTips = this.currentFrameBody.querySelectorAll(
        ".pp-found-node-tip"
      );
      const self = this;
      this.currentFrameBody.onclick = e => {
        if (e.target.className === "pp-popup-close") {
          return;
        }
        self.removeOverlayForAll();
        allTips.forEach(c => {
          removeClass(c, "active");
          removeClass(c, "hover");
        });
      };
    },
    setTipPopupPosition(node, tip) {
      const popup = tip.querySelector(".pp-popup");
      const gutter = 30;
      const documentDim = {
        width: this.frameParams.width,
        height: this.currentFrameBody.clientHeight
      };
      const nodeDim = {
        ...getElementBounding(node, this.currentFrame.contentWindow)
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
      const tipWidth = 13 / 2;

      //BottomCenter as default
      tip.style.top = nodeDim.top + nodeDim.height + "px";
      tip.style.left = nodeDim.left + nodeDim.width / 2 + "px";
      if (rightCenter()) {
        tip.style.top = nodeDim.top + nodeDim.height / 2 - tipWidth + "px";
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
    renderTipsStyles(d) {
      const css = `.pp-found-node-tip {
       position: absolute;
       left: 50%;
       top: 50%;
       transform: translate(-50%, -50%);
       z-index: 9999;
      }
      .pp-found-node-tip.active {
        z-index: 99999;
      }
      .pp-found-node-tip .pp-point {
        display: none;
        position: absolute;
        width: 13px;
        height: 13px;
        background-color: red;
        border: 2px solid #fff;
        border-radius: 50%;
      }
      @media (min-width: 480px){
        .pp-found-node-tip .pp-popup {
          background-color: #fff;
          padding: 20px;
          border-radius: 5px;
          visibility: hidden;
          box-shadow: 0 2px 170px rgba(0, 0, 0, 0.5);
        }
      }
      .pp-popup.left, .pp-popup.right, .pp-popup.top, .pp-popup.bottom  {
        position: absolute
      }
      .pp-popup.left {
        right: calc(100% + 30px);
        top: calc(50% + 6px);
        transform: translate(0, -50%);
      }
      .pp-popup.right {
        left: calc(100% + 30px);
        top: calc(50% + 6px);
        transform: translate(0, -50%);
      }
      .pp-popup.top {
        bottom: calc(100% + 30px);
        left: calc(50% + 6px);
        transform: translate(-50%, 0);
      }
      .pp-popup.bottom {
        top: calc(100% + 30px);
        left: calc(50% + 6px);
        transform: translate(-50%, 0);
      }
      .pp-popup:before {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
      }
      .pp-popup.top:before {
        bottom: -5px;
        left: 50%;
        transform: translate(-50%, 0);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #fff;

      }
      .pp-popup.bottom:before {
        top: -5px;
        left: 50%;
        transform: translate(-50%, 0);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 5px solid #fff;
      }
      .pp-popup.left:before {
      top: 50%;
        right: -5px;
        transform: translate(0, -50%);
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 5px solid #fff;
      }
      .pp-popup.right:before {
        top: 50%;
        left: -5px;
        transform: translate(0, -50%);
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-right: 5px solid #fff;
      }
      .pp-found-node-tip.active .pp-popup {
        visibility: visible;
        width: 250px;
        height: auto;
      }
      .pp-found-node-tip.hover .pp-point {
        z-index: 2;
        opacity: 0;
      }
      .pp-found-node-tip .pp-popup .title {
        color: #404241;
        font-size: 11px;
        display: block;
      }
      .pp-found-node-tip .pp-popup .node {
        color: red;
      }
      .pp-found-node-tip .pp-popup .design {
        color: green;
      }
      .pp-popup-close {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 13px;
        height: 13px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 47.971 47.971'%3E%3Cpath d='M28.228 23.986L47.092 5.122a2.998 2.998 0 0 0 0-4.242 2.998 2.998 0 0 0-4.242 0L23.986 19.744 5.121.88a2.998 2.998 0 0 0-4.242 0 2.998 2.998 0 0 0 0 4.242l18.865 18.864L.879 42.85a2.998 2.998 0 1 0 4.242 4.241l18.865-18.864L42.85 47.091c.586.586 1.354.879 2.121.879s1.535-.293 2.121-.879a2.998 2.998 0 0 0 0-4.242L28.228 23.986z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        cursor: pointer;
        opacity: 0.5;
      }
      .pp-popup-close:hover {
        opacity: 0.8;
      }
      .node-highlight {
        z-index: 9999;
      }
      .pp-element {
        border: 1px dashed #05f;
      }
      .pp-hover {
        outline: rgb(17, 151, 200) solid 2px !important;
        cursor: pointer;
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
    applyAdditionalFrameStyles() {
      this.currentFrameBody.style.setProperty(
        "overflow-x",
        "hidden",
        "important"
      );
    },
    preventAllLinks(frameWindow) {
      const anchors = frameWindow.document.getElementsByTagName("a");
      for (let i = 0; i < anchors.length; i++) {
        anchors[i].removeAttribute("href");
        const old_element = anchors[i];
        const new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
        new_element.onclick = () => {
          return false;
        };
      }
      frameWindow.onbeforeunload = e => {
        e.preventDefault();
        e.returnValue = "";
      };
    },
    scrollToTargetElement(element) {
      if (!element || !this.currentFrameDocument) {
        return;
      }
      const all = this.currentFrameDocument.querySelectorAll(".pp-element");
      const target = all[element.foundNodeIndex];
      if (!this.noScroll) {
        scrollTo(
          this.currentFrameDocument.scrollingElement,
          target.offsetTop - 100,
          100
        );
      } else {
        this.noScroll = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
body {
  overflow: hidden;
}
.site-viewer {
  position: relative;
  overflow: hidden;
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

  .frame {
    position: relative;
    background-color: #fff;
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
