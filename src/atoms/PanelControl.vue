<template>
  <div class="panel-control">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "PanelControl"
};
</script>

<style lang="scss" scoped>
.panel-control {
  margin: 0 15px;
  height: 100%;
}
</style>
