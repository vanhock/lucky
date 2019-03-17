<template>
  <div class="design-inspector" v-if="shouldShow" :style="setInspectorSizes">
    <img :src="image" alt="design image" />
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
    ...mapGetters(["designBlocks", "designImage", "frameParams"]),
    shouldShow() {
      return this.image && this.designBlocks && this.designBlocks.length;
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
    },
    setInspectorSizes() {
      if (!this.frameParams) {
        return;
      }
      return {
        width: this.frameParams.width + "px",
        height: window.outerHeight
      };
    }
  }
};
</script>

<style scoped></style>
