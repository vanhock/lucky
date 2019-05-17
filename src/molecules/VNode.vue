<template>
  <div
    class="v-node"
    :class="{ active: active }"
    :style="{ zIndex: 20 + id, width: width, height: height, left: x, top: y }"
    @click="$emit('click')"
    @dblclick="$emit('dblclick')"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "VNode",
  created() {
    this.active = this.toggleActive;
  },
  watch: {
    toggleActive(value) {
      return (this.active = value);
    }
  },
  data: () => ({
    active: false
  }),
  props: {
    id: Number,
    name: String,
    width: String,
    height: String,
    x: String,
    y: String,
    toggleActive: Boolean
  }
};
</script>

<style lang="scss">
.v-node {
  position: absolute;
  &.visible {
    outline: 1px solid rgba(0, 85, 255, 0.15);
  }
  &:hover {
    background-color: rgba(0, 85, 255, 0.15);
    outline: 1px solid rgba(0, 85, 255, 0.35);
  }
}
</style>
