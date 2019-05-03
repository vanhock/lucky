<template>
  <v-button
    class="v-button-inline"
    @click="$emit('click')"
    :loading="loading"
    :theme="appTheme"
    ><slot></slot
  ></v-button>
</template>

<script>
import VButton from "../../atoms/VButton";
export default {
  name: "VButtonInline",
  components: { VButton },
  extends: VButton
};
</script>

<style lang="scss" scoped>
.v-button-inline {
  &.white,
  &.dark {
    background-color: transparent;
    border-color: transparent;
    box-shadow: none;
  }
  &.white {
    color: $color-w3;
  }
  &.dark {
    color: $color-w1;
  }
}
</style>
