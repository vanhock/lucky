<template>
  <div class="layout layout-content-with-sidebar">
    <div class="layout-content"><slot></slot></div>
    <div class="layout-sidebar"><slot name="sidebar"></slot></div>
  </div>
</template>

<script>
export default {
  name: "ContentWithSidebar"
};
</script>

<style lang="scss" scoped>
.layout {
  &-content-with-sidebar {
    display: grid;
    grid-template-columns: 2.5fr 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: ". .";
    grid-column-gap: 40px;
  }
}
</style>
