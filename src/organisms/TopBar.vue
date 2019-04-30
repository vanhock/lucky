<template>
  <div class="top-bar">
    <project-navigation-toolbar
      :current-project="currentProject"
      :current-page="currentPage"
      :projects="Projects"
    />
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
