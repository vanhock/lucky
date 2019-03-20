<template>
  <div class="top-panel">
    <div class="container">
      <router-link class="site-logo" to="/"></router-link>
      <design-inspector-controls class="left" />
      <v-menu class="right icon-menu">
        <div @click="toggleTasksList"><i class="fas fa-bars"></i></div>
      </v-menu>
    </div>
    <task-list v-show="showTasksList" :tasks="foundNodes" v-if="foundNodes" />
  </div>
</template>

<script>
import VMenu from "../atoms/Menu";
import TaskList from "./TaskList";
import { mapGetters } from "vuex";
import DesignInspectorControls from "../molecules/DesignInspectorControls";
export default {
  name: "TopPanel",
  components: {DesignInspectorControls, VMenu, TaskList },
  data: () => ({
    showTasksList: true
  }),
  computed: {
    ...mapGetters(["foundNodes"])
  },
  methods: {
    toggleTasksList() {
      this.showTasksList = !this.showTasksList
    }
  }
};
</script>

<style lang="scss" scoped>
@import url("https://use.fontawesome.com/releases/v5.7.2/css/all.css");
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
