<template>
  <i-frame
    :src="websiteUrl"
    :width="frameWidth"
    :height="frameHeight"
    @load="onLoad"
  >
    <div class="frame-nodes" v-if="frameNodes && frameNodes.length">
      <v-node
        v-for="node in frameNodes"
        :key="node.id"
        :id="node.id"
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
import { getElementBounding } from "../../utils";
import VNode from "../../molecules/VNode";
export default {
  name: "WebsiteInspectorNew",
  components: { VNode, IFrame },
  data: () => ({
    websiteUrl: location.href,
    frameWidth: window.innerWidth + "px",
    frameHeight: window.innerHeight - 24 + "px",
    frameNodes: []
  }),
  methods: {
    onLoad({ frameNodes, frameWindow }) {
      console.log("on frame load!");
      this.frameNodes = frameNodes.map((el, id) => {
        const elBounding = getElementBounding(el, frameWindow);
        return {
          id: id,
          name: el.className || el.id || el.tagName,
          width: elBounding.width + "px",
          height: elBounding.height + "px",
          x: elBounding.left + "px",
          y: elBounding.top + "px"
        };
      });
    }
  }
};
</script>

<style scoped></style>
