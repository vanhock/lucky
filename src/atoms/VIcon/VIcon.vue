<template>
  <div class="v-icon">
    <div
      class="v-icon-image"
      v-if="mode === 'image'"
      :class="`icon-${icon}`"
      :style="{
        width: params && params.iconSize,
        height: params && params.iconSize
      }"
    ></div>
    <Zodicon
      v-if="mode === 'zondicon'"
      class="icon"
      :icon="icon"
      :style="{
        width: params && params.iconSize,
        height: params && params.iconSize,
        fontSize: params && params.textSize
      }"
    />
    <feather-icon
      v-if="mode === 'feather'"
      class="icon"
      :type="icon"
      :fill="params && params.fill"
      :stroke="params && params.stroke"
      :size="(params && params.iconSize) || '24px'"
    />
  </div>
</template>

<script>
import Zodicon from "vue-zondicons";
import FeatherIcon from "vue-feather";
export default {
  name: "VIcon",
  components: { FeatherIcon, Zodicon },
  props: {
    icon: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      default: "image"
    },
    params: {
      type: Object,
      default: () => {}
    },
    textSize: { type: String, default: "12px" }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/sprites";
@each $key, $value in $sprites {
  .icon-#{$key} {
    @include sprite($key);
  }
}
.v-icon {
  display: flex;
  &-image {
    background-size: contain;
  }
}
</style>
