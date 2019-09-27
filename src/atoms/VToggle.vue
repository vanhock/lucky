<template>
  <div
    class="v-toggle"
    :class="[
      { active: active, 'show-text': !hideText, background: background },
      appTheme
    ]"
    @click="$emit('click')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <v-icon
      v-if="icon"
      class="icon"
      :mode="mode"
      :icon="currentIcon"
      :params="params"
    />
    <div class="text-block">
      <div
        class="text"
        v-if="text"
        :style="{ fontSize: textSize, color: params && params.color }"
      >
        <span>{{ text }}</span>
      </div>
      <div class="label" v-if="label">{{ label }}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import VIcon from "./VIcon/VIcon";
export default {
  name: "VToggle",
  components: { VIcon },
  data: () => ({
    hover: false
  }),
  computed: {
    ...mapState(["appTheme"]),
    currentIcon() {
      return (this.iconHover && this.hover && this.iconHover) || this.icon;
    }
  },
  props: {
    active: { type: Boolean, default: false },
    icon: String,
    iconHover: String,
    text: String,
    hideText: Boolean,
    label: {
      type: [String, Number]
    },
    theme: { type: String, default: "white" },
    iconSize: { type: String, default: "16px" },
    textSize: { type: String, default: "12px" },
    background: Boolean,
    mode: {
      type: String,
      default: "zondicon"
    },
    params: {
      type: Object,
      default: {
        iconSize: "16px",
        textSize: "12px"
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.v-toggle {
  position: relative;
  padding: 0 15px;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: $color-b5;
  font-size: 12px;
  &.background {
    background-color: $color-w3;
    &:hover {
      background-color: $color-w4;
      .icon {
        fill: $color-b6;
        svg {
          fill: $color-b6;
        }
      }
    }
  }
  .text-block {
  }
  .icon {
    fill: $color-b5;
    & + .text-block .text {
      margin-left: 7px;
    }
  }
  .text {
    font-weight: 600;
  }
  .label {
    position: absolute;
    left: 52%;
    top: 8px;
    margin-bottom: 3px;
    padding: 1px 5px;
    min-width: 16px;
    text-align: center;
    background-color: #fff;
    color: $color-w3;
    border-radius: 5px;
    font-size: 9px;
    line-height: 10px;
    font-weight: 800;
  }
  &:not(.show-text) {
    .text {
      display: none;
      position: absolute;
      top: 50px;
      @include galign();
      margin-left: 0;
      background-color: $color-b2;
      color: #fff;
      min-width: 100px;
      padding: 5px;
      text-align: center;
      z-index: 12;
      font-size: 12px;
      &:before {
        position: absolute;
        content: "";
        width: 0;
        height: 0;
        top: -7px;
        @include galign();
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 7px solid $color-b2;
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
      svg {
        fill: $color-w2;
      }
    }
  }
  &:hover {
    //background-color: rgba(0, 0, 0, 0.24);
  }
  &:not(.active):not(.background) {
    &:hover {
      color: $color-b4;
      .icon {
        fill: $color-b4;
        svg {
          fill: $color-b4;
        }
      }
    }
  }
}
</style>
