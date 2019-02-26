<template>
  <div class="top-panel">
    <div class="container">
      <div class="site-logo"></div>
      <v-menu class="right icon-menu">
        <div><i class="fas fa-bars"></i></div>
      </v-menu>
    </div>
    <task-list :tasks="foundNodes" v-if="foundNodes" />
  </div>
</template>

<script>
import VMenu from "../atoms/Menu";
import TaskList from "./TaskList";
import { mapGetters } from "vuex";
export default {
  name: "TopPanel",
  components: { VMenu, TaskList },
  computed: {
    ...mapGetters(["foundNodes"])
  }
};
</script>

<style lang="scss" scoped>
@import url("https://use.fontawesome.com/releases/v5.7.2/css/all.css");
.top-panel {
  display: flex;
  height: 50px;
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
  width: 30px;
  height: 30px;
  background: url("/pixel.png") no-repeat;
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
