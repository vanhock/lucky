<template>
  <div class="projects-list">
    <project-item
      v-for="project in projects"
      :key="project.id"
      :project="project"
      :name="project.name"
      :caption="project.updatedAt"
      :text="`Pages: ${project.pagesCount || 0}`"
      @delete="$emit('delete', project)"
      @edit="$emit('edit', project)"
    />
  </div>
</template>

<script>
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
  }
};
</script>

<style lang="scss" scoped>
.projects-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 20px;
  margin-top: 20px;
  justify-items: stretch;
}
</style>
