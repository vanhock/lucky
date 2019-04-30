<template>
  <div class="projects-list">
    <project-item
      v-for="project in projects"
      :key="project.id"
      :name="project.name"
      :caption="project.updatedAt"
      :text="`Pages: ${project.pagesCount || 0}`"
    />
  </div>
</template>

<script>
import ProjectItem from "../molecules/ProjectItem";
export default {
  name: "ProjectsList",
  components: { ProjectItem },
  props: {
    projects: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style scoped></style>
