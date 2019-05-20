<template>
  <div
    class="v-node"
    :data-id="id"
    :data-depth="depthLevel"
    :class="{ active: active, hover: hover }"
    :style="{
      zIndex: 20 - depthLevel,
      width: width,
      height: height,
      left: x,
      top: y,
      display: hidden ? 'none' : 'block'
    }"
    @click="$emit('click')"
    @dblclick="$emit('dblclick')"
    @mouseenter="toggleHover"
    @mouseleave="toggleHover"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "VNode",
  data: () => ({
    hover: false
  }),
  props: {
    id: Number,
    name: String,
    width: String,
    height: String,
    x: String,
    y: String,
    depthLevel: Number,
    toggleActive: Boolean,
    hidden: Boolean,
    active: Boolean
  },
  methods: {
    toggleHover(e) {
      if (!e) {
        return;
      }
      e.type === "mouseenter" ? (this.hover = true) : (this.hover = false);
    }
  }
};
</script>
