<template>
  <header>
    <slot></slot>
  </header>
</template>
<script>
export default {
  name: "Header"
};
</script>
<style lang="scss">
header {
  position: relative;
  width: 100%;
  height: 92px;
  background-color: #2a2a2a;
}
</style>
