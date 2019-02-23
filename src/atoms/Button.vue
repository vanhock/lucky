<template>
  <button @click="$emit('click')" @touchmove="$emit('click')">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "Button"
};
</script>

<style lang="scss" scoped>
button {
  display: block;
  padding: 10px 37px;
  margin: 0 auto;
  font-weight: bold;
  border-radius: 26px;
  font-size: 20px;
  background-color: $color-w1;
  color: #fff;
  cursor: pointer;
  @include box-shadow(deep);
  &[disabled] {
    opacity: 0.7;
  }
}
</style>
