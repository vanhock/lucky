<template>
  <div class="tasks">
    <ul class="tasks-list">
      <li
        v-for="(task, index, i) in tasks"
        :class="{ active: activeTaskIndex && activeTaskIndex === i }"
        @click="setActiveTask(index)"
      >
        <div class="index">{{ i + 1 }}</div>
        <div class="header">{{ task.name }}</div>
        <div class="issues">
          Found errors: <b>{{ task.issues.length }}</b>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Hub from "../atoms/hub";
export default {
  name: "TaskList",
  props: {
    tasks: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data: () => ({
    activeTaskIndex: null
  }),
  methods: {
    setActiveTask(node, index) {
      this.activeTaskIndex = index;
      node.scrollIntoView();
      Hub.$emit("setActiveTask", { node: node, index: index });
    }
  }
};
</script>

<style lang="scss" scoped>
.tasks {
  position: absolute;
  top: 50px;
  right: 0;
  width: 400px;
  max-height: 600px;
  background-color: #fff;
  color: #000;
  overflow-x: hidden;
  overflow-y: auto;
  border-radius: 0 0 0 5px;
  .tasks-list {
    margin: 0;
    padding: 0;
    li {
      position: relative;
      list-style: none;
      padding: 13px 20px 15px 35px;
      margin: 15px 30px;
      border-radius: 5px;
      border: 2px solid transparent;
      @include box-shadow(deep);
      will-change: box-shadow;
      transition: box-shadow 0.1s linear;
      cursor: pointer;
      .header {
        height: 13px;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .index {
        position: absolute;
        left: 8px;
        @include valign();
        color: $color-b3;
        font-size: 12px;
      }
      .issues {
        font-size: 12px;
        margin-top: 10px;
        b {
          color: $color-red;
        }
      }
      &:not(.active):hover {
        @include box-shadow(very-deep);
      }
      &.active {
        border-color: $color-w1;
      }
    }
  }
}
</style>
