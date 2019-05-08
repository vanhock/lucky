<template>
  <div id="pp-app">
    <div class="pp-iframe-wrapper">
      <iframe></iframe>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  mounted() {
    /*const iframe = document.querySelector(".pp-iframe-wrapper iframe");
    iframe.src = location.href;*/
  },
  data: () => ({
    example: "test"
  }),
  computed: {
    ...mapGetters(["inspector"])
  }
};
</script>

<style lang="scss">
.body {
  background-color: #000;
}
.pp-iframe-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>