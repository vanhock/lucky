<template>
  <div class="pp-frame-nodes" :class="{ selected: selected.id }">
    <v-node
      class="pp-node"
      v-for="node in nodes"
      @click="$emit('click', node)"
      :active="selected.id === node.id"
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
</template>

<script>
import VNode from "./VNode";
export default {
  name: "FrameNodes",
  components: { VNode },
  props: {
    nodes: {
      type: Array,
      default: () => []
    },
    selected: {
      type: Object,
      default: () => {}
    }
  }
};
</script>

<style lang="scss" scoped>
.pp-frame-nodes {
  .pp-node {
    position: absolute;
    outline: 1px solid rgba(0, 85, 255, 0.15);
    &.visible {
      outline: 1px solid rgba(0, 85, 255, 0.15);
    }
    &:not(.active):hover {
      background-color: rgba(0, 85, 255, 0.15);
      outline: 1px solid rgba(0, 85, 255, 0.35);
    }
    &.active {
      z-index: 22;
      background-color: transparent;
      outline: 4px solid rgba(0, 85, 255, 0.45);
    }
  }
  &.selected {
    .pp-node:not(.active) {
      outline: 1px solid rgba(0, 85, 255, 0.1);
    }
  }
}
</style>
