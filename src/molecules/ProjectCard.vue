<template>
  <div class="project-card">
    <div class="image"></div>
    <div class="text">
      <div class="name">{{ project.name }}</div>
      <div class="lastUpdate">{{ project.lastUpdate }}</div>
      <div class="tasksCount">Tasks: {{ project.tasksCount }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProjectCard",
  props: {
    project: {
      type: Object,
      default: () => ({})
    }
  }
};
</script>

<style lang="scss" scoped></style>
