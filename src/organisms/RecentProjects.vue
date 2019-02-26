<template>
  <div class="recent-projects">
    <project-card
      v-for="(project, id) in projects"
      :project="project"
      @click="loadProject(id)"
    />
  </div>
</template>

<script>
import ProjectCard from "../molecules/ProjectCard";
export default {
  name: "RecentProjects",
  components: { ProjectCard },
  props: {
    projects: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    loadProject(id) {
      return true;
    }
  }
};
</script>

<style scoped></style>
