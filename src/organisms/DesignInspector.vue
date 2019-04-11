<template>
  <div
    class="design-inspector"
    v-if="shouldShow"
    :style="inspectorSizes"
    :class="{ 'only-found': showOnlyFoundBlocks }"
    @scroll="onDocumentScroll"
  >
    <img :src="designImage" alt="design image" class="image" />
    <div
      class="design-block"
      v-for="(block, index) in foundDesignBlocks"
      :style="setBlockStyle(block)"
      :class="{
        hidden: block.hide || !showAllBlocks,
        found: block.foundNodeIndex !== undefined,
        active: index === targetDesignIndex
      }"
      :key="index"
      @mouseenter="toggleClass"
      @mouseleave="toggleClass"
      @click="onDesignBlockClick(block.nodeIndex, index, block.foundNodeIndex)"
    ></div>
  </div>
</template>

<script>
import ViewMixin from "../mixins/ViewMixin.js";
import { mapGetters } from "vuex";
import { addClass, removeClass, scrollTo } from "../atoms/utils";

export default {
  name: "DesignInspector",
  mixins: [ViewMixin],
  data: () => ({
    noScroll: false
  }),
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
      return this.getViewParam("showAllDesignBlocks");
    },
    showOnlyFoundBlocks() {
      return this.getViewParam("showFoundDesignBlocks");
    },
    syncScroll() {
      return this.getViewParam("syncScroll");
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
          42 +
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
  watch: {
    targetElement(element) {
      this.scrollToTargetElement(element.designIndex);
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
    onDesignBlockClick(nodeIndex, designBlockIndex, foundNodeIndex) {
      this.setTargetElement(nodeIndex, designBlockIndex, foundNodeIndex);
      this.noScroll = true;
    },
    setTargetElement(nodeIndex, designBlockIndex, foundNodeIndex) {
      this.$store.dispatch("setTargetElement", {
        nodeIndex: parseInt(nodeIndex),
        designIndex: parseInt(designBlockIndex),
        foundNodeIndex: parseInt(foundNodeIndex)
      });
      this.scrollToTargetElement(designBlockIndex);
    },
    scrollToTargetElement(designBlockIndex) {
      if (!designBlockIndex) {
        return;
      }
      const all = document.querySelectorAll(".design-inspector .design-block");
      const target = all[designBlockIndex];
      if (!this.noScroll) {
        scrollTo(
          document.querySelector(".design-inspector"),
          target.offsetTop - 100,
          100
        );
      } else {
        this.noScroll = false;
      }
    },
    onDocumentScroll(e) {
      if (!this.syncScroll) {
        return;
      }
      this.$emit("designScrollTop", e.target.scrollTop);
    },
    scrollDocument(scroll) {
      document.querySelector(".design-inspector").scrollTop = scroll;
    }
  }
};
</script>

<style lang="scss" scoped>
.design-inspector {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  border-bottom: 4px solid #000;
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
