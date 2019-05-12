<template>
  <v-card
    class="v-card-clear"
    :name="name"
    :image="image"
    :caption="caption"
    :text="text"
    @click="$emit('click')"
  >
  </v-card>
</template>

<script>
import VCard from "../../atoms/VCard";
export default {
  name: "VCardClear",
  components: { VCard },
  extends: VCard,
  props: {
    item: Object
  }
};
</script>

<style lang="scss">
.v-card-clear {
  .name {
    font-size: 14px;
    max-height: 60px;
    overflow: hidden;
  }
}
</style>
