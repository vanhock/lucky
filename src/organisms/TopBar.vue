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
import ProjectNavigationToolbar from "../molecules/Toolbars/ProjectNavigationToolbar";
export default {
  name: "TopBar",
  components: { ProjectNavigationToolbar },
  extends: ProjectNavigationToolbar
};
</script>

<style lang="scss">
.top-bar {
  display: flex;
  padding: 0 25px;
  background-color: #fff;
  border-radius: 7px;
  @include box-shadow(medium);
  height: 50px;
  margin-bottom: 30px;
  &-left {
    margin-right: auto;
  }
  &-right {
    margin-left: auto;
  }

  .project-toolbar {
    .project-selector {
      color: $color-b2;
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style>
