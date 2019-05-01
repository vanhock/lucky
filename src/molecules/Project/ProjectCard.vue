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
  background-color: rgba(255, 255, 255, 0.57);
  height: 180px;
  border-radius: 5px;
  @include box-shadow(deep);
  will-change: box-shadow, background-color;
  transition: box-shadow, background-color .1s ease-out;
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
    background-color: $color-base;
    @include box-shadow(very-deep);
  }
}
</style>
