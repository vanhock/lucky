<template>
  <div class="page-selector" v-if="hasCurrentProject" ref="selectorWrapper">
    <div
      class="page-selector-project-name"
      v-if="hasCurrentProject"
      v-show="!editing"
      @click="$router.push(`/${currentProject.id}/pages`)"
    >
      {{ currentProject.url }}
    </div>
    <!-- ToDo: Need to project selector dropdown here -->
    <template v-if="hasCurrentPage">
      <span class="page-selector-divider" v-show="!editing"></span>
      <div
        class="page-selector-page-rename"
        ref="pageName"
        :contenteditable="editing"
        @click="openEdit"
        v-clickoutside="renamePage"
        @keydown.enter="renamePage"
      >
        {{ currentPage.name }}
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { PAGE_EDIT_PAGE } from "../../services/store/mutation-types";
import { selectElementContents } from "../../utils";
export default {
  name: "PageSelector",
  data: () => ({
    editing: false
  }),
  computed: {
    ...mapGetters([
      "currentProject",
      "currentPage",
      "hasCurrentPage",
      "hasCurrentProject"
    ])
  },
  methods: {
    openEdit(e) {
      this.editing = true;
      this.$nextTick(() => {
        const el = e.target;
        el.focus();
        selectElementContents(el);
      });
    },
    renamePage() {
      const name = this.$refs.pageName.innerText;
      this.editing = false;
      this.$refs.selectorWrapper.focus();
      if (!name || name === "" || name === this.currentPage.name) {
        return;
      }
      this.$store.dispatch(PAGE_EDIT_PAGE, {
        id: this.currentPage.id,
        name: name
      });
    }
  }
};
</script>

<style lang="scss">
.page-selector {
  position: absolute;
  @include galign();
  display: flex;
  justify-content: center;
  align-items: center;
  & > * {
    margin: 0 5px;
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &-divider {
    width: 10px;
    height: 1px;
    background-color: $color-b4;
    transform: rotate(-45deg);
    pointer-events: none;
  }
  &-project-name {
    color: $color-b4;
    font-size: 12px;
    cursor: default;
  }
  &-page-rename {
    height: auto;
    max-height: 20px;
    color: $color-b6;
    font-size: 14px;
    margin-top: 2px;
    cursor: pointer;
    border-radius: 2px;
    padding: 4px 0;
    &[contenteditable="true"] {
      background-color: #fff;
      color: $color-b2;
      padding: 5px 10px 4px;
      margin-top: 0;
    }
  }
}
</style>
