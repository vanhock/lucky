<template>
  <div class="view">
    <site-viewer />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SiteViewer from "../molecules/SiteViewer";
export default {
  name: "ViewScreen",
  components: { SiteViewer },
  computed: {
    ...mapGetters(["design", "siteUrl", "viewerReady"])
  }
};
</script>

<style scoped></style>
