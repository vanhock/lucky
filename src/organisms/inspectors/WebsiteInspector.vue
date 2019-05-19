<template>
  <div class="website-inspector">
    <i-frame
      ref="frame"
      :src="websiteUrl"
      :width="frameWidth"
      :height="frameHeight"
      @load="onLoad"
      :frame-styles="frameStyles"
    >
      <div class="frame-nodes" v-show="showFrameNodes">
        <v-node
          class="pp-node"
          v-for="node in frameNodes"
          @click="selectNode(node)"
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
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import IFrame from "../../molecules/Inspector/IFrame";
import {
  getDomDepthLevel,
  getElementBounding,
  hasParentElementWithSameSize
} from "../../utils";
import VNode from "../../molecules/Inspector/VNode";
import {
  INSPECTOR_SET_TARGET_ELEMENT,
  INSPECTOR_SET_TASK_CREATOR_STATE
} from "../../services/store/mutation-types";
import {
  INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT,
  INSPECTOR_CREATOR_STATE_SETTING_TASK,
  INSPECTOR_STATE_CREATING
} from "../../services/store/InspectorsStoreModule";
export default {
  name: "WebsiteInspector",
  components: { VNode, IFrame },
  created() {
    this.renderFrameStyles();
  },
  data: () => ({
    websiteUrl: location.href,
    frameWidth: window.innerWidth + "px",
    frameHeight: window.innerHeight - 49 + "px",
    frameNodes: [],
    frameStyles: ""
  }),
  computed: {
    ...mapGetters(["state", "taskCreatorState"]),
    showFrameNodes() {
      return (
        this.state === INSPECTOR_STATE_CREATING &&
        this.taskCreatorState === INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT &&
        this.frameNodes &&
        this.frameNodes.length
      );
    }
  },
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
          y: elBounding.top + "px",
          node: el
        };
      });
    },
    selectNode(node) {
      this.$store.dispatch(INSPECTOR_SET_TARGET_ELEMENT, node);
      this.$store.dispatch(
        INSPECTOR_SET_TASK_CREATOR_STATE,
        INSPECTOR_CREATOR_STATE_SETTING_TASK
      );
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
