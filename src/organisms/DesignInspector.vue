<template>
  <div
    class="design-inspector"
    v-if="shouldShow"
    :style="inspectorSizes"
    :class="{ 'only-found': showOnlyFoundBlocks }"
  >
    <img :src="designImage" alt="design image" class="image" />
    <div
      class="design-block"
      v-for="(block, index) in designBlocks"
      :style="setBlockStyle(block)"
      :class="{
        hidden: block.hide || !showAllBlocks,
        found: block.found,
        active: index === targetBlockIndex
      }"
      :key="index"
      @mouseenter="toggleClass"
      @mouseleave="toggleClass"
    >
      <div class="design-block-index">{{ index }}</div>
    </div>
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
      "viewParams",
      "targetElement"
    ]),
    shouldShow() {
      return this.designImage && this.designBlocks && this.designBlocks.length;
    },
    showAllBlocks() {
      return this.getParam("showAllDesignBlocks");
    },
    showOnlyFoundBlocks() {
      return this.getParam("showFoundDesignBlocks");
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
    },
    targetBlockIndex() {
      return (
        this.targetElement &&
        this.targetElement.hasOwnProperty("blockIndex") &&
        this.targetElement.blockIndex
      );
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
    },
    getParam(name) {
      if (!this.viewParams) {
        return;
      }
      return (
        this.viewParams &&
        this.viewParams.hasOwnProperty(name) &&
        this.viewParams[name]
      );
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
    &.active {
      background-color: rgba(0, 85, 255, 0.5);
    }
    &-index {
      position: absolute;
      left: 10px;
      top: 10px;
      font-weight: bold;
      background-color: #fff;
      border-radius: 22px;
      padding: 3px 10px;
      font-size: 11px;
    }
  }
  &.only-found {
    .design-block:not(.found) {
      display: none;
    }
  }
}
</style>
