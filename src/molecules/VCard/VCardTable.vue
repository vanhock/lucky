<template>
  <v-card
    class="v-card-table"
    :class="{ clear: clear }"
    :name="name"
    :caption="caption | normalizeDate"
    :text="text"
    :badge="badge"
  >
    <template v-if="actions && actions.length">
      <v-button-inline
        v-for="(action, index) in actions"
        :key="index"
        :class="`action-${action.name}`"
        @click="$emit(action.name)"
        >{{ action.title }}</v-button-inline
      >
    </template>
    <slot></slot>
  </v-card>
</template>

<script>
import VCard from "../../atoms/VCard";
import VButtonInline from "../VButton/VButtonInline";
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
    },
    clear: Boolean
  }
};
</script>

<style lang="scss">
.v-card-table {
  .v-card-image-container {
    height: 70px;
  }
  .v-card-text-container {
    flex-direction: row;
    height: 70px;
    padding: 0 20px;
    align-items: center;
    .name {
      width: 40%;
      margin: 0;
      color: $color-b3;
    }
    .text {
      margin: 0;
    }
  }
  .v-card-content {
    .caption {
      margin: 0;
    }
  }
  .v-card-actions {
    right: 0;
    @include valign();
  }
  &.clear {
    .v-card-content {
      color: $color-b1;
      @include box-shadow(normal);
    }
  }
}
</style>
