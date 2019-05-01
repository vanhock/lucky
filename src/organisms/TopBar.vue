<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <slot name="left"></slot>
      <project-navigation-toolbar
        :current-project="currentProject"
        :current-page="currentPage"
        :projects="projects"
      />
    </div>
    <div class="top-bar-right"><slot name="right"></slot></div>
  </div>
</template>

<script>
import ProjectNavigationToolbar from "../molecules/ProjectNavigationToolbar";
export default {
  name: "TopBar",
  components: { ProjectNavigationToolbar },
  extends: ProjectNavigationToolbar
};
</script>

<style scoped></style>
