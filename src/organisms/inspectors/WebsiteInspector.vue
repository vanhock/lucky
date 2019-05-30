<template>
  <div class="website-inspector">
    <preloader :show="frameLoading" type="cube">
      <i-frame
        ref="frame"
        :src="websiteUrl"
        :width="frameWidth"
        :height="frameHeight"
        @update="onFrameUpdated"
        @stateChanged="onFrameStateChanged"
        :frame-styles="frameStyles"
      >
        <div
          class="pp-frame-nodes"
          v-show="showFrameNodes"
          :class="{ selected: targetElement.id }"
        >
          <v-node
            class="pp-node"
            v-for="node in frameNodes"
            @click="selectNode(node)"
            :active="targetElement.id === node.id"
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
        <v-draw v-show="showFrameNodes" />
      </i-frame>
    </preloader>
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
  INSPECTOR_CREATOR_STATE_SELECTING_AREA,
  INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT,
  INSPECTOR_CREATOR_STATE_SETTING_TASK,
  INSPECTOR_STATE_CREATING,
  INSPECTOR_STATE_INSPECTING
} from "../../services/store/InspectorsStoreModule";
import VDraw from "../../molecules/Inspector/VDraw";
import Preloader from "../../atoms/Preloader";
export default {
  name: "WebsiteInspector",
  components: { Preloader, VDraw, VNode, IFrame },
  created() {
    this.renderFrameStyles();
  },
  data: () => ({
    websiteUrl: location.href,
    frameWidth: window.innerWidth + "px",
    frameHeight: window.innerHeight - 49 + "px",
    frameNodes: [],
    frameStyles: "",
    frameLoading: false
  }),
  computed: {
    ...mapGetters(["state", "taskCreatorState", "targetElement"]),
    showFrameNodes() {
      return (
        this.frameNodes &&
        this.frameNodes.length &&
        this.state === INSPECTOR_STATE_CREATING &&
        (this.taskCreatorState === INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT ||
          (Object.keys(this.targetElement).length &&
            this.taskCreatorState === INSPECTOR_CREATOR_STATE_SETTING_TASK))
      );
    },
    showDrawTool() {
      return this.state === INSPECTOR_STATE_CREATING;
    }
  },
  methods: {
    onFrameUpdated({ frameNodes, frameWindow }) {
      this.frameLoading = false;
      this.reloadFrameSlot(frameNodes, frameWindow);
    },
    onFrameStateChanged(state) {
      if (state === "loading") {
        this.frameLoading = true;
      } else if (state === "complete") {
        this.frameLoading = false;
      }
    },
    reloadFrameSlot(frameNodes, frameWindow) {
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
      this.$nextTick(() => {
        const input = document.getElementById("pp-task-creator-input");
        input.select();
        input.focus();
      });
    },
    renderFrameStyles() {
      this.frameStyles = `
      .pp-node {
        position: absolute;
        outline: 1px solid rgba(0, 85, 255, 0.15);
      }
      .pp-node.visible {
        outline: 1px solid rgba(0, 85, 255, 0.15);
      }
      .pp-node:not(.active):hover {
        background-color: rgba(0, 85, 255, 0.15);
        outline: 1px solid rgba(0, 85, 255, 0.35);
      }
      .pp-node.active {
        z-index: 22;
        background-color: transparent;
        outline: 4px solid rgba(0, 85, 255, 0.45);
      }
      .pp-frame-nodes.selected .pp-node:not(.active) {
        outline: 1px solid rgba(0, 85, 255, 0.1);
      }
      `;
    }
  }
};
</script>

<style lang="scss" scoped>
.website-inspector {
  position: relative;
}
</style>
