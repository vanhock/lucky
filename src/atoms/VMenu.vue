<template>
  <div class="menu" :class="align">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "VMenu",
  props: {
    align: {
      type: String,
      default: "horizontal"
    }
  }
};
</script>

<style lang="scss" scoped>
.menu {
  display: block;
  &.horizontal {
    .menu-item {
      padding: 4px 10px;
    }
  }
  &.vertical {
    .menu-item {
      padding: 10px 4px;
    }
  }
}
</style>
