<template>
  <div class="filters-bar">
    <slot></slot>
  </div>
</template>

<script>
import { serializeObject } from "../utils";

export default {
  name: "FiltersBar",
  mounted() {
    this.$children.forEach(children => {
      children.$on("change", this.onFilterChange);
    });
  },
  beforeDestroy() {
    this.$children.forEach(children => {
      children.$off("change", this.onFilterChange);
    });
  },
  data: () => ({
    changedFilters: {}
  }),
  methods: {
    onFilterChange(filter) {
      this.setChangedFilter(filter);
      this.$emit("filtersChange", serializeObject(this.changedFilters));
    },
    setChangedFilter(filter) {
      if (this.changedFilters.length) {
        for (let key in this.changedFilters) {
          if (this.changedFilters[key].name === filter.name) {
            return (this.changedFilters[key] = filter);
          }
        }
      }

      this.changedFilters = filter;
    }
  }
};
</script>

<style lang="scss">
.filters-bar {
  display: flex;
  margin-left: auto;
}
</style>
