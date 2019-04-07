<template>
  <div class="tasks" ref="tasksList">
    <ul class="tasks-list">
      <li
        v-for="(task, nodeIndex, i) in tasks"
        :key="nodeIndex"
        :class="{
          active: targetNodeIndex === parseInt(nodeIndex)
        }"
        @click="setTargetElement(nodeIndex, task.designBlockIndex, i)"
      >
        <div class="index">{{ i + 1 }}</div>
        <div class="header">{{ task.name }}</div>
        <div class="issues">
          Node index <b>{{ nodeIndex }}</b
          ><br />
          Block index: <b>{{ task.designBlockIndex }}</b>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { scrollTo } from "../atoms/utils";
import { mapGetters } from "vuex";
export default {
  name: "TaskList",
  props: {
    tasks: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    ...mapGetters([
      "currentFrameBody",
      "currentFrameWindow",
      "currentFrameDocument",
      "targetElement"
    ]),
    listElement() {
      return this.$refs.tasksList;
    },
    targetNodeIndex() {
      return this.targetElement && this.targetElement.nodeIndex;
    }
  },
  watch: {
    targetElement(value) {
      if (!value) {
        return;
      }
      this.scrollToTask(value.foundNodeIndex);
    }
  },
  data: () => ({
    noScroll: false
  }),
  methods: {
    setTargetElement(nodeIndex, designIndex, foundNodeIndex) {
      this.$store.dispatch("setTargetElement", {
        nodeIndex: parseInt(nodeIndex),
        designIndex: parseInt(designIndex),
        foundNodeIndex: parseInt(foundNodeIndex)
      });
      /** If we set target element from Task List **/
      this.noScroll = true;
    },
    scrollToTask(index) {
      const targetTask = this.listElement.getElementsByTagName("li")[index];
      if (!targetTask) {
        return;
      }
      if (!this.noScroll) {
        scrollTo(this.listElement, targetTask.offsetTop - 100, 100);
      } else {
        this.noScroll = false;
      }
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
  z-index: 10;
  transition: opacity 0.2s ease-in;
  opacity: 1;
  &:hover {
    opacity: 1;
  }
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
