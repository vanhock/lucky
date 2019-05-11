<template>
  <div class="top-panel">
    <div class="top-panel-container">
      <a class="site-logo" :href="userPanelUrl" target="_blank"
        ><img
          src="chrome-extension://__MSG_@@pniajcifdcfkbcigpipdidnhhjbliglh/icons/38.png"
        />
      </a>
      <design-params />
      <div
        style="flex-grow: 1;
    flex-shrink: 999;"
      >
        <center-toolbar />
      </div>
      <view-params class="right" v-if="designBlocks" />
      <v-toggle
        class="right"
        icon="refresh"
        text="Reload view"
        :show-text="false"
        @click="$emit('reloadView')"
      />
      <v-toggle
        class="right"
        icon="bolt"
        :text="$t('Quick task create')"
        :show-text="false"
      ></v-toggle>
      <v-toggle
        class="right"
        icon="inbox-full"
        :icon-hover="showTasksList ? 'arrow-thin-right' : ''"
        :text="$t('Tasks')"
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
  computed: {
    ...mapGetters(["foundNodes", "designBlocks"])
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
  &-container {
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
  padding: 5px 18px;
  margin-left: -18px;
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
