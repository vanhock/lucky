<template>
  <v-button
    class="v-button-primary"
    @click="$emit('click')"
    :loading="loading"
    :theme="appTheme"
    ><slot></slot
  ></v-button>
</template>

<script>
import VButton from "../../atoms/VButton";
export default {
  name: "VButtonPrimary",
  components: { VButton },
  extends: VButton
};
</script>

<style lang="scss" scoped>
.v-button-primary {
}
</style>
