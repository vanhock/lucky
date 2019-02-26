<template>
  <div class="home">
    <div class="content">
      <div class="container">
        <div class="info-block">
          <h1 class="header">Make your website Perfect!</h1>
          <div class="description">
            <p>
              Get difference between mockup and your website without layering!
            </p>
            <p>There are 2 simple steps to do that:</p>
          </div>
        </div>
        <enter-website ref="url" />
        <design-uploader ref="uploader" v-if="!design" />
        <router-link tag="div" to="/view">
          <v-button v-if="design" :disabled="!viewerReady">Let`s go!</v-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import DesignUploader from "../organisms/DesignUploader";
import EnterWebsite from "../organisms/EnterWebsite";
import VButton from "../atoms/Button";
import { mapGetters } from "vuex";
export default {
  name: "home",
  components: { DesignUploader, EnterWebsite, VButton },
  computed: {
    ...mapGetters(["design", "siteUrl", "viewerReady"])
  }
};
</script>

<style lang="scss">
body {
  background-color: $color-bg1;
  overflow-x: hidden;
}
.home {
  overflow-x: hidden;
  .content {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 2;
  }
  .container {
    max-width: 540px;
    margin: 0 auto;
  }
  h1.header {
    max-width: 340px;
    font-size: 50px;
    margin-bottom: 5px;
  }
  .description {
    color: $color-b4;
    font-size: 18px;
    line-height: 16px;
  }
}
</style>
