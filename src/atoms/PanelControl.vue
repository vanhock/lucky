<template>
  <div
    class="panel-control"
    @mouseover="dropdown ? (showDropdown = !showDropdown) : ''"
  >
    <slot></slot>
    <div class="dropdown" v-if="dropdown">
      <slot name="dropdown"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "PanelControl",
  data: () => ({
    showDropdown: false
  }),
  props: {
    dropdown: Boolean
  }
};
</script>

<style lang="scss" scoped>
.panel-control {
  margin: 0 5px;
  height: 100%;
}
</style>
