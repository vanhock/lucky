<template>
  <i-frame
    :src="websiteUrl"
    :width="frameWidth"
    :height="frameHeight"
    @load="onLoad"
    :frame-styles="frameStyles"
  >
    <div class="frame-nodes" v-if="frameNodes && frameNodes.length">
      <v-node
        class="pp-node"
        v-for="node in frameNodes"
        :key="node.id"
        :id="node.id"
        :hidden="node.hidden"
        :depth-level="node.depthLevel"
        :width="node.width"
        :height="node.height"
        :x="node.x"
        :y="node.y"
      ></v-node>
    </div>
  </i-frame>
</template>

<script>
import IFrame from "../../molecules/IFrame";
import {getDomDepthLevel, getElementBounding, hasParentElementWithSameSize} from "../../utils";
import VNode from "../../molecules/VNode";
export default {
  name: "WebsiteInspector",
  components: { VNode, IFrame },
  created() {
    this.renderFrameStyles();
  },
  data: () => ({
    websiteUrl: location.href,
    frameWidth: window.innerWidth + "px",
    frameHeight: window.innerHeight - 50 + "px",
    frameNodes: [],
    frameStyles: ""
  }),
  methods: {
    onLoad({ frameNodes, frameWindow }) {
      console.log("on frame load!");
      this.frameNodes = frameNodes.map((el, id) => {
        const elBounding = getElementBounding(el, frameWindow);
        return {
          id: id,
          depthLevel: getDomDepthLevel(el),
          hidden: hasParentElementWithSameSize(el, frameWindow),
          name: el.className || el.id || el.tagName,
          width: elBounding.width + "px",
          height: elBounding.height + "px",
          x: elBounding.left + "px",
          y: elBounding.top + "px"
        };
      });
    },
    renderFrameStyles() {
      const style = `.pp-node {
        position: absolute;
        outline: 1px solid rgba(0, 85, 255, 0.15);
      }
      .pp-node.visible {
        outline: 1px solid rgba(0, 85, 255, 0.15);
      }
      .pp-node.hover {
        background-color: rgba(0, 85, 255, 0.15);
        outline: 1px solid rgba(0, 85, 255, 0.35);
      }
      `;
      this.frameStyles = style;
    }
  }
};
</script>

<style scoped></style>
