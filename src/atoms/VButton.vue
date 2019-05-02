<template>
  <button
    @click="$emit('click')"
    @touchmove="$emit('click')"
    :class="[{ loading: loading }, appTheme]"
  >
    <slot></slot>
  </button>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "VButton",
  props: {
    loading: Boolean,
    theme: {
      type: String,
      default: "white"
    }
  },
  computed: {
    ...mapState(["appTheme"])
  }
};
</script>

<style lang="scss" scoped>
button {
  display: block;
  padding: 8px 38px;
  font-weight: 600;
  border-radius: 26px;
  font-size: 14px;
  cursor: pointer;
  color: #fff;
  @include box-shadow(deep);
  &[disabled] {
    opacity: 0.7;
    pointer-events: none;
  }
  &.loading {
    pointer-events: none;
  }

  &.dark {
    background-color: $color-w1;
    &.loading {
      @include loading-spinner($activeColor: $color-w1, $time: 1.4s);
      color: $color-w1;
    }
  }
  &.white {
    background-color: $color-w3;
    &.loading {
      @include loading-spinner($activeColor: $color-w4, $time: 1.4s);
      color: $color-w3;
    }
  }
}
</style>
