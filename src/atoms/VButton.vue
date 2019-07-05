<template>
  <button
    type="button"
    class="v-button"
    @click="$emit('click')"
    @touchmove="$emit('click')"
    :class="[{ loading: loading, 'no-shadow': noShadow }, appTheme]"
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
    },
    noShadow: Boolean
  },
  computed: {
    ...mapState(["appTheme"])
  }
};
</script>

<style lang="scss">
.v-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 38px;
  font-weight: 600;
  border-radius: 26px;
  font-size: 14px;
  cursor: pointer;
  color: #fff;
  line-height: initial;
  &:not(.no-shadow) {
    @include box-shadow(deep);
  }

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
