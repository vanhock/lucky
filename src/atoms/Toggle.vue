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
  padding: 0 10px;
  height: inherit;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: $color-b6;
  .icon {
    width: 15px;
    height: 15px;
    fill: $color-b6;
  }
  .text {
    font-size: 11px;
    margin-left: 7px;
  }
  &.active {
    color: $color-w2;
    .icon {
      fill: $color-w2;
    }
  }
  &:hover {
    background-color: $color-b2;
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
