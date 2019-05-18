<template>
  <div class="top-panel">
    <div class="top-panel-container">
      <v-toggle class="left" icon="menu" :icon-size="iconSize" />
      <design-params v-if="hasDesign" />
      <v-toggle
        class="left"
        icon="refresh"
        text="Reload view"
        :show-text="false"
        @click="$emit('reloadView')"
      />
      <div
        style="flex-grow: 1;
    flex-shrink: 999;"
      >
        <center-toolbar />
      </div>
      <view-params class="right" v-if="hasDesign" />
      <v-toggle
        class="right"
        icon="add-outline"
        :text="$t('New task')"
        :icon-size="iconSize"
        background
      ></v-toggle>
      <v-toggle
        class="right"
        icon="inbox-full"
        :icon-hover="showTasksList ? 'arrow-thin-right' : ''"
        :text="$t('Tasks')"
        :icon-size="iconSize"
        :show-text="false"
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
import ViewParams from "../molecules/Toolbars/ViewToolbar";
import VToggle from "../atoms/VToggle";
import DesignParams from "../molecules/Toolbars/DesignToolbar";
import CenterToolbar from "../molecules/Toolbars/CenterToolbar";
import config from "../config";
export default {
  name: "TopPanel",
  components: {
    CenterToolbar,
    DesignParams,
    VToggle,
    ViewParams,
    TaskList
  },
  data: () => ({
    showTasksList: false,
    userPanelUrl: config.apiUrl
  }),
  props: {
    iconSize: {
      type: String,
      default: "20px"
    }
  },
  computed: {
    ...mapGetters(["foundNodes", "designBlocks", "hasDesign"])
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
  height: 50px;
  width: 100%;
  background-color: $color-bg2;
  &-container {
    display: flex;
    margin: 0 auto;
    align-items: center;
    width: 100%;
    height: 100%;
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
  padding: 5px 10px;
  display: flex;
  img {
    width: 28px;
    height: 28px;
  }
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
