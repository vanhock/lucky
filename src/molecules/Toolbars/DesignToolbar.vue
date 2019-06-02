<template>
  <div class="design-params">
    <panel-control>
      <template v-if="designBlocks.length">
        <v-toggle
          :active="showAllBlocks"
          :icon="(showFoundBlocks && 'target') || 'layers'"
          :text="(showFoundBlocks && 'Found layers') || 'All layers'"
          hide-text
          @click="toggleLayersViewMode"
        />
        <v-toggle icon="border-none" text="Guides" hide-text />
      </template>

      <v-toggle icon="repost" :text="$t('Add design')" />
    </panel-control>
  </div>
</template>

<script>
import PanelControl from "../../atoms/PanelControl";
import VToggle from "../../atoms/VToggle";
import ViewMixin from "../../mixins/ViewMixin";
import { mapGetters } from "vuex";
export default {
  name: "DesignParams",
  mixins: [ViewMixin],
  components: { PanelControl, VToggle },
  computed: {
    ...mapGetters(["designBlocks"]),
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
