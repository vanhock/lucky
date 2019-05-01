<template>
  <v-button class="v-button-primary" @click="$emit('click')"
    ><slot></slot
  ></v-button>
</template>

<script>
import VButton from "../../atoms/VButton";
export default {
  name: "VButtonPrimary",
  components: { VButton }
};
</script>

<style lang="scss" scoped>
.v-button-primary {
}
</style>
