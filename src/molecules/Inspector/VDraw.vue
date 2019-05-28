<template>
  <v-stage :config="configKonva" class="v-draw">
    <v-layer><v-circle :config="configCircle"></v-circle></v-layer>
  </v-stage>
</template>

<script>
import Vue from "vue";
import VueKonva from "vue-konva";

Vue.use(VueKonva);
export default {
  name: "VDraw",
  data: () => ({
    configKonva: {
      width: 200,
      height: 200
    },
    configCircle: {
      x: 100,
      y: 100,
      radius: 70,
      fill: "red",
      stroke: "black",
      strokeWidth: 4
    }
  })
};
</script>

<style lang="scss" scoped>
  .v-draw {
    position: absolute;
    z-index: 9999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
