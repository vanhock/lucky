<template>
  <div class="menu">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "Menu"
  }
</script>

<style lang="scss" scoped>
  .menu {
    display: flex;
    align-items: center;
    justify-content: center;
    &.right {
      justify-content: right;
      margin-left: auto;
    }
    &.left {
      justify-content: left;
      margin-right: auto;
    }
  }
</style>