<template>
  <div class="top-panel">
    <div class="top-panel-container">
      <v-toggle class="left" icon="menu" :icon-size="iconSize" />
      <design-params v-if="hasDesign" />
      <panel-control v-show="inspectingState">
        <v-toggle class="left" icon="upload" text="Compare with design" />
        <!--<v-toggle
          class="left"
          icon="text-box"
          text="Inspecting"
          hide-text
          :active="inspectorToolActive"
          @click="toggleInspector"
        />-->
      </panel-control>
      <div
        style="flex-grow: 1;
    flex-shrink: 999;"
      >
        <center-toolbar />
      </div>
      <view-params class="right" v-if="hasDesign" />
      <v-toggle
        v-if="state === 'INSPECTOR_STATE_INSPECTING'"
        class="right"
        icon="add-outline"
        :text="$t('New task')"
        :icon-size="iconSize"
        @click="setCreatingTaskState"
        background
      ></v-toggle>
      <v-toggle
        class="right"
        icon="inbox-full"
        :icon-hover="showTasksList ? 'arrow-thin-right' : ''"
        :text="$t('Tasks')"
        :icon-size="iconSize"
        hide-text
        :label="tasksCount"
        :active="showTasksList"
        @click="toggleTasksList"
      />
    </div>
    <task-list v-show="showTasksList" :tasks="tasks" />
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
import {
  INSPECTOR_SET_STATE,
  INSPECTOR_SET_TOOL
} from "../services/store/mutation-types";
import {
  INSPECTOR_STATE_CREATING,
  INSPECTOR_STATE_INSPECTING,
  INSPECTOR_TOOL_DOM_INSPECTOR
} from "../services/store/InspectorsStoreModule";
import PanelControl from "../atoms/PanelControl";
export default {
  name: "TopPanel",
  components: {
    PanelControl,
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
    ...mapGetters([
      "foundNodes",
      "designBlocks",
      "hasDesign",
      "state",
      "tasks",
      "tasksCount",
      "tool"
    ]),
    inspectorToolActive() {
      return this.tool === INSPECTOR_TOOL_DOM_INSPECTOR;
    },
    inspectingState() {
      return this.state === INSPECTOR_STATE_INSPECTING;
    }
  },
  methods: {
    toggleTasksList() {
      this.showTasksList = !this.showTasksList;
    },
    setCreatingTaskState() {
      this.$store.dispatch(INSPECTOR_SET_STATE, INSPECTOR_STATE_CREATING);
    },
    toggleInspector() {
      if (this.tool === "INSPECTOR_TOOL_DOM_INSPECTOR") {
        return this.$store.dispatch(INSPECTOR_SET_TOOL, "");
      }
      this.$store.dispatch(INSPECTOR_SET_TOOL, "INSPECTOR_TOOL_DOM_INSPECTOR");
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
