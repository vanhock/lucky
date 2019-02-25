<template>
  <div class="view">
    <top-panel />
    <site-viewer />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import TopPanel from "../molecules/TopPanel";
import SiteViewer from "../molecules/SiteViewer";
export default {
  name: "ViewScreen",
  components: { SiteViewer, TopPanel },
  computed: {
    ...mapGetters(["design", "siteUrl", "viewerReady"])
  }
};
</script>

<style scoped></style>
