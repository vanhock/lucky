<template>
  <div class="design-inspector" v-if="shouldShow" :style="inspectorSizes">
    <img :src="designImage" alt="design image" class="image" />
    <div
      class="design-block"
      v-for="(block, index) in designBlocks"
      :style="setBlockStyle(block)"
      :key="index"
    ></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
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
        width: block.width + "px",
        height: block.height + "px"
      };
    }
  }
};
</script>

<style lang="scss" scoped>
  .design-inspector {
    overflow-x: hidden;
    overflow-y: auto;
    .image {
    }
  }
</style>
