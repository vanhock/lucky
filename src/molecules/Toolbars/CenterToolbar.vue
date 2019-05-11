<template>
  <div class="center-toolbar">
    <template v-if="currentProject">
      <div class="project-selector" v-show="!editing">
        {{ currentProject.name }}
      </div>
      <!-- ToDo: Need to project selector dropdown here -->
      <template v-if="currentPage">
        <span class="divider"></span>
        <div class="page-rename" :contenteditable="editing">
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
export default {
  name: "CenterToolbar",
  components: { VToggle, PanelControl },
  data: () => ({
    editing: false
  }),
  props: {
    currentProject: { type: Object, default: () => {} },
    currentPage: { type: Object, default: () => {} },
    projects: { type: Array, default: () => [] }
  },
  computed: {
    ...mapGetters(["targetElement"])
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
    color: $color-b6;
    font-size: 14px;
    margin-top: 2px;
    cursor: pointer;
  }
}
</style>
