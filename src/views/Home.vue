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
        <label for="input-url">
          <router-link
            tag="div"
            to="/view"
            v-if="designBlocks"
            :disabled="!viewerReady"
          >
            <v-button :disabled="!viewerReady">{{
              !viewerReady ? "⬑ Enter website, before we start" : "Let`s go!"
            }}</v-button>
          </router-link>
        </label>
        <design-uploader ref="uploader" />
        <recent-projects />
      </div>
    </div>
  </div>
</template>

<script>
import DesignUploader from "../organisms/DesignUploader";
import EnterWebsite from "../organisms/EnterWebsite";
import RecentProjects from "../organisms/RecentProjects";
import VButton from "../atoms/Button";
import { mapGetters } from "vuex";
export default {
  name: "home",
  components: { DesignUploader, EnterWebsite, RecentProjects, VButton },
  mounted() {
    this.$store.dispatch("resetHomepageState");
  },
  computed: {
    ...mapGetters(["designBlocks", "websiteUrl", "viewerReady"])
  }
};
</script>

<style lang="scss">
body {
  overflow-x: hidden;
  overflow-y: auto;
  background-color: $color-bg1;
}
.home {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 50px;
  background-color: $color-bg1;
  .container {
    max-width: 540px;
    margin: 0 auto;
  }
  h1.header {
    max-width: 280px;
    font-size: 45px;
    margin-bottom: 5px;
    color: $color-base;
    font-weight: 600;
  }
  .description {
    color: $color-b5;
    font-size: 16px;
    line-height: 24px;
  }
}
</style>
