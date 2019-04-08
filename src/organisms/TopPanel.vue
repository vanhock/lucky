<template>
  <div class="top-panel">
    <div class="container">
      <router-link class="site-logo" to="/"></router-link>
      <view-params />
      <design-params />
      <panel-control :dropdown="true">
        <toggle icon="tuning" text="Recognize settings" />
        <template v-slot:dropdown>
          <v-menu>
            <menu-item>
              <input type="text" value="5" />
            </menu-item>
          </v-menu>
        </template>
      </panel-control>
      <toggle
        class="right"
        icon="inbox-full"
        text="Found elements"
        @click="toggleTasksList"
      />
    </div>
    <task-list v-show="showTasksList" :tasks="foundNodes" v-if="foundNodes" />
  </div>
</template>

<script>
import VMenu from "../atoms/Menu";
import TaskList from "./TaskList";
import { mapGetters } from "vuex";
import ViewParams from "../molecules/ViewParams";
import PanelControl from "../atoms/PanelControl";
import Toggle from "../atoms/Toggle";
import MenuItem from "../atoms/MenuItem";
import DesignParams from "../molecules/DesignParams";
export default {
  name: "TopPanel",
  components: {
    DesignParams,
    MenuItem,
    Toggle,
    PanelControl,
    ViewParams,
    VMenu,
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
  height: 32px;
  width: 100%;
  background-color: $color-bg2;
  .container {
    display: flex;
    margin: 0 auto;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 15px;
    & > * {
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
  margin-right: 150px;
  margin-left: -15px;
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
