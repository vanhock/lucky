<template>
  <div class="design-params">
    <panel-control>
      <v-toggle
        :active="showAllBlocks"
        :icon="(showFoundBlocks && 'target') || 'layers'"
        :text="(showFoundBlocks && 'Found layers') || 'All layers'"
        :show-text="false"
        @click="toggleLayersViewMode"
      />
      <v-toggle icon="border-none" text="Guides" :show-text="false" />
      <v-toggle icon="repost" text="Change design" />
    </panel-control>
  </div>
</template>

<script>
import PanelControl from "../atoms/PanelControl";
import VToggle from "../atoms/VToggle";
import ViewMixin from "../mixins/ViewMixin";

export default {
  name: "DesignParams",
  mixins: [ViewMixin],
  components: { PanelControl, VToggle },
  computed: {
    showAllBlocks() {
      return this.getViewParam("showAllDesignBlocks");
    },
    showFoundBlocks() {
      return this.getViewParam("showFoundDesignBlocks");
    }
  },
  methods: {
    toggleLayersViewMode() {
      if (!this.getViewParam("showAllDesignBlocks")) {
        this.setViewParam("showAllDesignBlocks", true);
      } else if (this.getViewParam("showFoundDesignBlocks")) {
        this.setViewParam("showAllDesignBlocks", false);
        this.setViewParam("showFoundDesignBlocks", false);
      } else {
        this.setViewParam("showFoundDesignBlocks", true);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.design-params {
  position: relative;
  background-color: rgba(255, 13, 242, 0.12);
}
</style>
