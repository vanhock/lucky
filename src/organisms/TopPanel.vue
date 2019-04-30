<template>
  <div class="top-panel">
    <div class="container">
      <router-link class="site-logo" to="/"></router-link>
      <design-params />
      <div
        style="flex-grow: 1;
    flex-shrink: 999;"
      >
        <project-toolbar />
      </div>
      <view-params @reloadView="$emit('reloadView')" class="right" />
      <v-toggle
        class="right"
        icon="inbox-full"
        :icon-hover="showTasksList ? 'arrow-thin-right' : ''"
        text="Found elements"
        :active="showTasksList"
        @click="toggleTasksList"
      />
    </div>
    <task-list v-show="showTasksList" :tasks="foundNodes" v-if="foundNodes" />
  </div>
</template>

<script>
import TaskList from "./TaskList";
import { mapGetters } from "vuex";
import ViewParams from "../molecules/ViewToolbar";
import VToggle from "../atoms/VToggle";
import DesignParams from "../molecules/DesignToolbar";
import ProjectToolbar from "../molecules/ProjectNavigationToolbar";
export default {
  name: "TopPanel",
  components: {
    ProjectToolbar,
    DesignParams,
    VToggle,
    ViewParams,
    TaskList
  },
  data: () => ({
    showTasksList: true
  }),
  computed: {
    ...mapGetters(["foundNodes"])
  },
  methods: {
    toggleTasksList() {
      this.showTasksList = !this.showTasksList;
    }
  }
};
</script>

<style lang="scss" scoped>
.top-panel {
  display: flex;
  height: 38px;
  width: 100%;
  background-color: $color-bg2;
  .container {
    display: flex;
    margin: 0 auto;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 15px;
    & > *:not(.site-logo) {
      height: 100%;
    }
  }
  .right {
    justify-content: right;
    margin-left: auto;
  }
  .left {
    justify-content: left;
    margin-right: auto;
  }
}
.site-logo {
  width: 32px;
  height: 32px;
  background: url(/pixel.png) no-repeat;
  margin-left: -12px;
  background-size: contain;
}
.icon-menu {
  height: 100%;
  & > * {
    position: relative;
    height: 100%;
    padding: 0 24px;
    cursor: pointer;
    i {
      position: absolute;
      color: $color-b6;
      @include align();
      font-size: 22px;
    }
    &:hover {
      background-color: $color-w1;
    }
  }
}
</style>
