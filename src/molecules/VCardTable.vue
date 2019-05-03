<template>
  <v-card class="v-card-table" :name="name" :caption="caption" :text="text">
    <template v-if="actions && actions.length">
      <v-button-inline
        v-for="(action, index) in actions"
        :key="index"
        :class="`action-${action.name}`"
        @click="$emit(action.name)"
        >{{ action.title }}</v-button-inline
      >
    </template>
  </v-card>
</template>

<script>
import VCard from "../atoms/VCard";
import VButtonInline from "./VButton/VButtonInline";
export default {
  name: "VCardTable",
  components: { VButtonInline, VCard },
  extends: VCard,
  props: {
    actions: {
      /**
       * name: String,
       * title: String
       */
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="scss">
.v-card.v-card-table {
  .v-card-text-container {
    flex-direction: row;
    height: 70px;
    padding: 0 20px;
    align-items: center;
    .name {
      margin-top: -10px;
      color: $color-b3;
    }
  }
  .actions {
    right: 0;
    @include valign();
  }
}
</style>
