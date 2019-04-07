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
      v-for="(block, index) in foundDesignBlocks"
      :style="setBlockStyle(block)"
      :class="{
        hidden: block.hide || !showAllBlocks,
        found: block.foundNodeIndex !== undefined && true,
        active: index === targetDesignIndex
      }"
      :key="index"
      @mouseenter="toggleClass"
      @mouseleave="toggleClass"
      @click="setTargetElement(block.nodeIndex, index, block.foundNodeIndex)"
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
      "foundDesignBlocks",
      "designImage",
      "designParams",
      "viewParams",
      "targetElement"
    ]),
    shouldShow() {
      return (
        this.designImage &&
        this.foundDesignBlocks &&
        this.foundDesignBlocks.length
      );
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
          window.innerHeight -
          this.viewParams.websiteInspectorHeight -
          32 +
          "px"
      };
    },
    targetDesignIndex() {
      return (
        this.targetElement &&
        this.targetElement.hasOwnProperty("designIndex") &&
        this.targetElement.designIndex
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
    },
    setTargetElement(nodeIndex, designBlockIndex, foundNodeIndex) {
      this.$store.dispatch("setTargetElement", {
        nodeIndex: nodeIndex,
        designIndex: designBlockIndex,
        foundNodeIndex: foundNodeIndex
      });
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
      outline: rgb(17, 151, 200) solid 2px !important;
      cursor: pointer;
    }
    &.active {
      background-color: rgba(0, 85, 255, 0.35);
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
