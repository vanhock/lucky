<template>
  <div class="view">
    <top-panel />
    <design-inspector />
    <site-inspector />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import TopPanel from "../organisms/TopPanel";
import SiteInspector from "../organisms/SiteInspector";
import DesignInspector from "../organisms/DesignInspector";
export default {
  name: "ViewScreen",
  components: {DesignInspector, SiteInspector, TopPanel },
  computed: {
    ...mapGetters(["design", "siteUrl", "viewerReady"])
  }
};
</script>
