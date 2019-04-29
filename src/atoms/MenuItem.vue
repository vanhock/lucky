<template>
  <div class="menu-item">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "MenuItem"
};
</script>

<style lang="scss" scoped>
.menu-item {
  display: block;
}
</style>
