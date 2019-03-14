<template>
  <div class="tasks" ref="tasksList">
    <ul class="tasks-list">
      <li
        v-for="(task, index, i) in tasks"
        :key="index"
        :class="{ active: activeTaskIndex === index }"
        @click="scrollToFoundNode(index, i)"
        :data-task-index="index"
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
import {scrollTo, getElementBounding} from "../atoms/utils";
import { mapGetters } from "vuex";
export default {
  name: "TaskList",
  mounted() {
    const self = this;
    Hub.$on("clickOnFoundNode", foundNode => {
      if (!foundNode) {
        return;
      }
      self.activeTaskIndex = foundNode.id.toString();
      const targetElement = document.querySelector(
        `[data-task-index='${foundNode.id}']`
      );
      if (targetElement) {
        scrollTo(this.$refs.tasksList, targetElement.offsetTop - 50, 100)
      }
    });
  },
  props: {
    tasks: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    ...mapGetters(["currentFrameBody", "currentFrameWindow", "currentFrameDocument"])
  },
  data: () => ({
    activeTaskIndex: null
  }),
  methods: {
    scrollToFoundNode(index, i) {
      const tip = this.currentFrameBody.querySelectorAll(".lky-error-tip")[i];
      const targetElement = this.currentFrameBody.querySelectorAll("*")[index];
      const targetElementOffset = getElementBounding(targetElement, this.currentFrameWindow);
      this.activeTaskIndex = index;

      scrollTo(this.currentFrameDocument.documentElement, targetElementOffset.top - 50, 100);
      Hub.$emit("highlightNode", targetElement, tip)
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
