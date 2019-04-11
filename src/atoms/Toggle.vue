<template>
  <div
    class="toggle"
    :class="{ active: active, 'show-text': showText }"
    @click="$emit('click')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <Zodicon v-if="icon" :icon="currentIcon" class="icon" />
    <div class="text" v-if="text">{{ text }}</div>
  </div>
</template>

<script>
import Zodicon from "vue-zondicons";
export default {
  name: "Toggle",
  components: { Zodicon },
  data: () => ({
    hover: false
  }),
  computed: {
    currentIcon() {
      return (this.iconHover && this.hover && this.iconHover) || this.icon;
    }
  },
  props: {
    active: { type: Boolean, default: false },
    icon: String,
    iconHover: String,
    text: String,
    showText: { type: Boolean, default: true }
  }
};
</script>

<style lang="scss" scoped>
.toggle {
  position: relative;
  padding: 0 14px;
  height: inherit;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: $color-b5;
  .icon {
    width: 16px;
    height: 16px;
    fill: $color-b5;
  }
  .text {
    font-size: 10px;
    margin-left: 7px;
  }
  &:not(.show-text) {
    .text {
      display: none;
      position: absolute;
      top: 45px;
      @include galign();
      margin-left: 0;
      background-color: $color-b5;
      color: #333;
      min-width: 70px;
      padding: 5px;
      text-align: center;
      font-weight: bold;
      z-index: 12;
      &:before {
        position: absolute;
        content: "";
        width: 0;
        height: 0;
        top: -7px;
        @include galign();
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 7px solid $color-b5;
      }
    }
    &:hover {
      .text {
        display: block;
      }
    }
  }
  &.active {
    color: $color-w2;
    .icon {
      fill: $color-w2;
    }
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.24);
  }
  &:not(.active) {
    &:hover {
      color: $color-b4;
      .icon {
        fill: $color-b4;
      }
    }
  }
}
</style>
