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
  padding: 4px 10px;
}
</style>
