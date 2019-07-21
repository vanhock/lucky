<template>
  <v-card
    class="v-card-clear"
    :name="name"
    :image="image"
    :caption="caption | normalizeDate"
    :badge="badge"
    :text="text"
    :selecting-mode="selectingMode"
    :show-menu="showMenu"
    @click="$emit('click')"
    @select="$emit('select')"
  >
    <template v-slot
      ><slot></slot
    ></template>
    <template v-slot:menu
      ><slot name="menu"></slot
    ></template>
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
