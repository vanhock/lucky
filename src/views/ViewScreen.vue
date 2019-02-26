<template>
  <div class="view">
    <top-panel />
    <site-viewer />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import TopPanel from "../organisms/TopPanel";
import SiteViewer from "../organisms/SiteViewer";
export default {
  name: "ViewScreen",
  components: { SiteViewer, TopPanel },
  computed: {
    ...mapGetters(["design", "siteUrl", "viewerReady"])
  }
};
</script>
