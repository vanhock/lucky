<template>
  <div class="center-toolbar">
    <template v-if="hasCurrentProject">
      <div
        class="project-selector"
        v-show="!editing"
        @click="$router.push(`/${currentProject.id}/pages`)"
      >
        {{ currentProject.name }}
      </div>
      <!-- ToDo: Need to project selector dropdown here -->
      <template v-if="hasCurrentPage">
        <span class="divider" v-show="!editing"></span>
        <div
          class="page-rename"
          ref="pageName"
          :contenteditable="editing"
          @click="openEdit"
          v-clickoutside="renamePage"
          @keydown.enter="renamePage"
        >
          {{ currentPage.name }}
        </div>
      </template>
    </template>
    <panel-control>
      <v-toggle
        icon="list-add"
        :text="$t('Create task (N)')"
        v-if="targetElement"
      ></v-toggle>
    </panel-control>
  </div>
</template>

<script>
import PanelControl from "../../atoms/PanelControl";
import VToggle from "../../atoms/VToggle";
import { mapGetters } from "vuex";
import {
  PAGE_EDIT_PAGE,
  PAGE_GET_PAGES,
  PROJECT_GET_ALL_PROJECTS
} from "../../services/store/mutation-types";
import { selectElementContents } from "../../utils";
export default {
  name: "CenterToolbar",
  components: { VToggle, PanelControl },
  data: () => ({
    editing: false
  }),
  computed: {
    ...mapGetters([
      "targetElement",
      "currentProject",
      "currentPage",
      "projects",
      "hasCurrentProject",
      "hasCurrentPage"
    ])
  },
  methods: {
    getProjects() {
      this.$store.dispatch(PROJECT_GET_ALL_PROJECTS);
    },
    getPages(projectId) {
      this.$store.dispatch(PAGE_GET_PAGES, { projectId: projectId });
    },
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
      if (!name || name === "") {
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

<style lang="scss" scoped>
.center-toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  & > * {
    margin: 0 5px;
  }
  .divider {
    width: 10px;
    height: 1px;
    background-color: $color-b4;
    transform: rotate(-45deg);
    pointer-events: none;
  }
  .project-selector {
    color: $color-b4;
    font-size: 13px;
    cursor: default;
  }
  .page-rename {
    height: auto;
    max-height: 20px;

    max-width: 250px;
    color: $color-b6;
    font-size: 14px;
    margin-top: 2px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
