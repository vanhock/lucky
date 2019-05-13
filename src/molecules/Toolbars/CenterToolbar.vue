<template>
  <div class="center-toolbar">
    <template v-if="currentProject">
      <div class="project-selector" v-show="!editing">
        {{ currentProject.name }}
      </div>
      <!-- ToDo: Need to project selector dropdown here -->
      <template v-if="currentPage">
        <span class="divider" v-show="!editing"></span>
        <div
          class="page-rename"
          :contenteditable="editing"
          @click="editing = true"
          v-clickoutside="(editing = false)"
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
  PAGE_GET_PAGES,
  PROJECT_GET_ALL_PROJECTS
} from "../../services/store/mutation-types";
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
      "projects"
    ])
  },
  methods: {
    getProjects() {
      this.$store.dispatch(PROJECT_GET_ALL_PROJECTS);
    },
    getPages(projectId) {
      this.$store.dispatch(PAGE_GET_PAGES, { projectId: projectId });
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
    height: 14px;
    max-width: 250px;
    color: $color-b6;
    font-size: 14px;
    margin-top: 2px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
