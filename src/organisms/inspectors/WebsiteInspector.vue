<template>
  <div class="website-inspector">
    <preloader :show="websiteStatus === 'loading'" type="cube">
      <i-frame
        ref="frame"
        :src="websiteUrl"
        :width="frameWidth"
        :height="frameHeight"
        @update="onFrameUpdated"
        @stateChanged="onFrameStateChanged"
        :frame-styles="frameStyles"
      >
        <frame-nodes
          v-show="showFrameNodes"
          :selected="targetElement"
          :nodes="frameNodes"
          @click="selectNode"
        />
      </i-frame>
      <v-draw v-show="showDrawTool" />
      <img
        class="v-screen-shot"
        v-show="false"
        :src="currentTask.screenShot"
      />
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
import {
  INSPECTOR_SET_STATE,
  INSPECTOR_SET_STATUS,
  INSPECTOR_SET_TARGET_ELEMENT
} from "../../services/store/mutation-types";
import VDraw from "../../molecules/Inspector/VDraw";
import Preloader from "../../atoms/Preloader";
import FrameNodes from "../../molecules/Inspector/FrameNodes";
export default {
  name: "WebsiteInspector",
  components: { FrameNodes, Preloader, VDraw, IFrame },
  created() {
    this.renderFrameStyles();
  },
  props: {
    websiteUrl: {
      type: String,
      default: "",
      required: true
    }
  },
  data: () => ({
    frameWidth: window.innerWidth + "px",
    frameHeight: window.innerHeight - 49 + "px",
    frameNodes: [],
    frameStyles: "",
    frameLoading: false
  }),
  computed: {
    ...mapGetters([
      "state",
      "taskCreatorState",
      "targetElement",
      "websiteStatus",
      "showDesignInspector",
      "compareMode",
      "tool",
      "currentTask"
    ]),
    showFrameNodes() {
      return (
        this.state === "INSPECTOR_STATE_INSPECTING" &&
        this.tool === "INSPECTOR_TOOL_DOM_INSPECTOR"
      );
    },
    showDrawTool() {
      return this.state === "INSPECTOR_STATE_CREATING";
    }
  },
  methods: {
    initView() {
      this.renderFrameStyles();
    },
    setFrameNodes(frameNodes, frameWindow) {
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
      this.$store.dispatch(INSPECTOR_SET_STATE, "INSPECTOR_STATE_CREATING");
      this.$nextTick(() => {
        const input = document.getElementById("pp-task-creator-input");
        input.select();
        input.focus();
      });
    },
    onFrameUpdated({ frameNodes, frameWindow }) {
      this.setFrameNodes(frameNodes, frameWindow);
      this.$nextTick(() => {
        this.onFrameStateChanged("complete");
      });
    },
    onFrameStateChanged(state) {
      this.$store.dispatch(INSPECTOR_SET_STATUS, {
        inspector: "website",
        status: state
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
  height: calc(100% - 50px);
  .preloader {
    height: 100%;
  }
  .v-screen-shot {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }
}
</style>
