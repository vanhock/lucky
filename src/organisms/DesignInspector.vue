<template>
  <div class="design-inspector" v-if="shouldShow" :style="inspectorSizes">
    <img :src="designImage" alt="design image" class="image" />
    <div
      class="design-block"
      v-for="(block, index) in designBlocks"
      :style="setBlockStyle(block)"
      :class="{ hidden: block.hide || !showAllBlocks }"
      :key="index"
      @mouseenter="toggleClass"
      @mouseleave="toggleClass"
    ></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { addClass, removeClass } from "../atoms/utils";

export default {
  name: "DesignInspector",
  computed: {
    ...mapGetters([
      "designBlocks",
      "designImage",
      "designParams",
      "viewParams"
    ]),
    shouldShow() {
      return this.designImage && this.designBlocks && this.designBlocks.length;
    },
    showAllBlocks() {
      return (
        this.viewParams &&
        this.viewParams.hasOwnProperty("showAllDesignBlocks") &&
        this.viewParams.showAllDesignBlocks
      );
    },
    inspectorSizes() {
      if (!this.designParams || !this.viewParams) {
        return;
      }
      return {
        width: this.designParams.width + "px",
        height:
          window.innerHeight - this.viewParams.websiteInspectorHeight + "px"
      };
    }
  },
  methods: {
    setBlockStyle(block) {
      if (!block) {
        return;
      }
      return {
        left: block.left + "px",
        top: block.top + "px",
        right: block.right + "px",
        bottom: block.bottom + "px",
        width: block.width + "px",
        height: block.height + "px"
      };
    },
    toggleClass(e) {
      if (!e) {
        return;
      }
      const el = e.target;
      e.type === "mouseenter"
        ? addClass(el, "hover")
        : removeClass(el, "hover");
    }
  }
};
</script>

<style lang="scss" scoped>
.design-inspector {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  .image {
  }
  .design-block {
    position: absolute;
    border: 1px dashed #05f;
    &.hover {
      background-color: rgba(0, 85, 255, 0.35);
    }
  }
}
</style>
