<template>
  <div class="card-general-list">
    <div class="header">
      <div class="title" v-if="title">{{ title }}</div>
      <filters-bar
        v-if="sort.length"
        @filtersChange="$emit('filtersChange', $event)"
      >
        <v-select-clear
          v-for="(item, index) in sort"
          :key="index"
          :name="item.name"
          :label="item.label"
          :options="item.options"
        />
      </filters-bar>
    </div>

    <div class="card-general-list-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import FiltersBar from "../organisms/FiltersBar";
import VSelectClear from "../molecules/VSelectClear";
export default {
  name: "CardGeneralList",
  components: { FiltersBar, VSelectClear },
  data: () => ({
    activeFilters: {}
  }),
  props: {
    title: String,
    sort: {
      /**
       * Array of objects
       * name: String,
       * options: Array
       * * name: String,
       * * value: String
       */
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="scss" scoped>
.card-general-list {
  .header {
    margin-top: 30px;
    display: flex;
  }
  .title {
    color: $color-b3;
  }
  &-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    margin-top: 20px;
    justify-items: stretch;
    @media (max-width: 1400px) {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
}
</style>
