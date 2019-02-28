<template>
  <div class="project-card" @click="$emit('click')">
    <div class="image"></div>
    <div class="text">
      <div class="name">{{ project.name }}</div>
      <div class="lastUpdate">{{ project.lastUpdate }}</div>
      <div class="tasksCount">Tasks: {{ tasksCount }}</div>
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
  },
  computed: {
    tasksCount() {
      return (
        this.project &&
        this.project.foundNodes &&
        Object.entries(this.project.foundNodes).length
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.project-card {
  background-color: $color-base;
  height: 180px;
  border-radius: 5px;
  @include box-shadow(deep);
  cursor: pointer;
  .text {
    padding: 10px 15px;
  }
  .name {
    font-size: 27px;
  }
  .tasksCount {
    margin-top: 10px;
  }
  &:hover {
    @include box-shadow(very-deep);
  }
}
</style>
