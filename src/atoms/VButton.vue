<template>
  <button
    @click="$emit('click')"
    @touchmove="$emit('click')"
    :class="{ loading: loading }"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "Button",
  props: {
    loading: Boolean
  }
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
    pointer-events: none;
  }
  &.loading {
    color: $color-w1;
    @include loading-spinner($time: 1.4s);
    pointer-events: none;
  }
}
</style>
