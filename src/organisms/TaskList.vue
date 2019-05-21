<template>
  <div class="tasks" ref="tasksList">
    <ul class="tasks-list" v-if="tasks && tasks.length">
      <v-card-clear
        v-for="task in tasks"
        :key="task.id"
        :name="task.name"
        :text="task.text"
        :caption="normalizeDate(task.updatedAt)"
      ></v-card-clear>
    </ul>
    <empty-placeholder
      v-if="!tasks || !tasks.length"
      icon="task-list"
      :title="$t('No tasks yet')"
      transparent
    />
  </div>
</template>

<script>
import { normalizeDate, scrollTo } from "../utils";
import { mapGetters } from "vuex";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import VCardClear from "../molecules/VCard/VCardClear";

export default {
  name: "TaskList",
  components: { VCardClear, EmptyPlaceholder },
  props: {
    tasks: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(["targetElement"]),
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
    INSPECTOR_SET_TARGET_ELEMENT(nodeIndex, designIndex, foundNodeIndex) {
      this.$store.dispatch("INSPECTOR_SET_TARGET_ELEMENT", {
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
    },
    normalizeDate(date) {
      return normalizeDate(date);
    }
  }
};
</script>

<style lang="scss" scoped>
.tasks {
  position: absolute;
  top: 50px;
  right: 0;
  width: 350px;
  height: calc(100% - 50px);
  background-color: $color-b5;
  color: #000;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 10;
  transition: opacity 0.2s ease-in;
  opacity: 1;
  @include box-shadow(medium);
  &:hover {
    opacity: 1;
  }
}
</style>
<style lang="scss">
.tasks {
  .tasks-list {
    margin: 0;
    padding: 0;
    .v-card {
      margin: 10px 15px;
    }
    .v-card-text-container {
      height: 110px;
    }
  }
}
</style>
