<template>
  <div
    class="layout layout-content-with-sidebar"
    :class="`sidebar-${sidebarPosition}`"
  >
    <div class="layout-sidebar" v-if="sidebarPosition === 'left'">
      <slot name="sidebar"></slot>
    </div>
    <div class="layout-content"><slot></slot></div>
    <div class="layout-sidebar" v-if="sidebarPosition === 'right'">
      <slot name="sidebar"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContentWithSidebar",
  props: {
    sidebarPosition: {
      type: String,
      default: "left"
    }
  }
};
</script>

<style lang="scss" scoped>
.layout {
  &-content-with-sidebar {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-areas: ". .";
    grid-column-gap: 40px;
    &.sidebar-right {
      grid-template-columns: 2.5fr 1.5fr;
    }
    &.sidebar-left {
      grid-template-columns: 1.5fr 2.5fr;
    }
  }
}
</style>
