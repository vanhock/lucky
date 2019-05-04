<template>
  <div class="projects-list">
    <project-item
      v-for="project in projects"
      :key="project.id"
      :project="project"
      :name="project.name"
      :caption="normalizeData(project.updatedAt)"
      :text="`Pages: ${project.pagesCount || 0}`"
      @delete="$emit('delete', project)"
      @edit="$emit('edit', project)"
    />
  </div>
</template>

<script>
import { normalizeData } from "../utils";
import ProjectItem from "../molecules/Project/ProjectItem";
export default {
  name: "ProjectsList",
  components: { ProjectItem },
  props: {
    projects: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  methods: {
    normalizeData(date) {
      return normalizeData(date);
    }
  }
};
</script>

<style lang="scss" scoped>
.projects-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  margin-top: 20px;
  justify-items: stretch;
  @media (max-width: 1400px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
