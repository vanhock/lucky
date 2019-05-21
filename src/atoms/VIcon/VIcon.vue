<template>
  <div class="v-icon">
    <div
      class="v-icon-image"
      :class="`icon-${icon}`"
      :style="{ width: size, height: size }"
    >
    </div>
  </div>
</template>

<script>
export default {
  name: "VIcon",
  props: {
    icon: {
      type: String,
      required: true
    },
    size: String
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
    background-size: cover;
  }
}
</style>
