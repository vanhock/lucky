<template>
  <div class="toggle" :class="{ active: active }" @click="$emit('click')">
    <Zodicon v-if="icon" :icon="icon" class="icon" />
    <div class="text" v-if="text">{{ text }}</div>
  </div>
</template>

<script>
import Zodicon from "vue-zondicons";
export default {
  name: "Toggle",
  components: { Zodicon },
  props: {
    active: {
      type: Boolean,
      default: false
    },
    icon: String,
    text: String
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
