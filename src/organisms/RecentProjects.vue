<template>
  <div class="recent-projects" v-if="projects">
    <project-card
      v-for="project in projects"
      :key="project.id"
      :project="project"
      @click="loadProject(project)"
    />
  </div>
</template>

<script>
import { getFromLocal } from "../atoms/utils";
import ProjectCard from "../molecules/ProjectCard";
export default {
  name: "RecentProjects",
  components: { ProjectCard },
  mounted() {
    this.getProjectsFromLocal();
  },
  data: () => ({
    projects: null
  }),
  methods: {
    getProjectsFromLocal() {
      this.projects = getFromLocal("recentProjects");
    },
    loadProject(project) {
      this.$store.dispatch("setCurrentProject", project).then(() => {
        this.$router.push({ name: "view" });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.recent-projects {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 20px;
  margin-top: 30px;
  justify-items: stretch;
}
</style>
