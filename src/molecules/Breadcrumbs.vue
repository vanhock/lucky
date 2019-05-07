<template>
  <div class="breadcrumb" v-if="items && items.length">
    <div class="breadcrumb-item" v-for="(route, index) in items" :key="index">
      <router-link :to="{ name: route.name }">{{ route.title }}</router-link>
    </div>
    <div
      class="breadcrumb-item"
      v-if="currentProject && Object.keys(currentProject).length"
    >
      {{ currentProject.name }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Breadcrumbs",
  created() {
    this.setBreadcrumbs();
    this.$router.afterEach(() => {
      this.setBreadcrumbs();
    });
  },
  data: () => ({
    tree: []
  }),
  computed: {
    ...mapGetters(["currentProject"]),
    items() {
      if (!this.tree) {
        return;
      }
      return this.tree
        .filter(r => r.path !== "" && r.name !== this.$route.name)
        .map(r => ({ name: r.name, title: r.meta.title }));
    }
  },
  methods: {
    setBreadcrumbs() {
      this.tree = this.$route.matched;
    }
  }
};
</script>

<style lang="scss" scoped>
.breadcrumb {
  display: flex;
  margin-bottom: 25px;
  .breadcrumb-item {
    font-size: 14px;
    color: $color-b4;
    &:not(:last-child) {
      margin-right: 25px;
    }
    &.active {
      color: $color-b3;
    }
    a {
      position: relative;
      color: $color-w3;
      text-decoration: none;
      &:after {
        content: "";
        position: absolute;
        right: -15px;
        @include valign();
        border-top: 3px solid transparent;
        border-left: 3px solid $color-b4;
        border-bottom: 3px solid transparent;
      }
    }
  }
}
</style>
