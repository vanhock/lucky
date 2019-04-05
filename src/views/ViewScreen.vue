<template>
  <div class="view">
    <top-panel />
    <design-inspector />
    <site-inspector />
  </div>
</template>

<script>
import TopPanel from "../organisms/TopPanel";
import SiteInspector from "../organisms/WebsiteInspector";
import DesignInspector from "../organisms/DesignInspector";
export default {
  name: "ViewScreen",
  components: { DesignInspector, SiteInspector, TopPanel }
};
</script>
