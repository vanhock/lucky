<template>
  <div class="design-inspector-controls">
    <panel-control>
      <toggle
        :active="showAllBlocks"
        :icon="(showFoundBlocks && 'target') || 'layers'"
        :text="(showFoundBlocks && 'Found layers') || 'All layers'"
        @click="toggleLayersViewMode"
      />
      <toggle
        :active="syncScroll"
        icon="link"
        text="Sync scroll"
        @click="toggleSyncScroll"
      ></toggle>
    </panel-control>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import PanelControl from "../atoms/PanelControl";
import Toggle from "../atoms/Toggle";

export default {
  name: "ViewParams",
  components: { PanelControl, Toggle },
  computed: {
    ...mapGetters(["viewParams"]),
    showAllBlocks() {
      return this.getViewParam("showAllDesignBlocks");
    },
    showFoundBlocks() {
      return this.getViewParam("showFoundDesignBlocks");
    },
    syncScroll() {
      return this.getViewParam("syncScroll");
    }
  },
  methods: {
    toggleLayersViewMode() {
      if (!this.getViewParam("showAllDesignBlocks")) {
        this.setParam("showAllDesignBlocks", true);
      } else if (this.getViewParam("showFoundDesignBlocks")) {
        this.setParam("showAllDesignBlocks", false);
        this.setParam("showFoundDesignBlocks", false);
      } else {
        this.setParam("showFoundDesignBlocks", true);
      }
    },
    toggleSyncScroll() {
      this.$store.dispatch("setViewParams", { syncScroll: !this.syncScroll });
    },
    setParam(name, value) {
      if (!name) {
        return;
      }
      const param = {};
      param[name] = value;
      this.$store.dispatch("setViewParams", param);
    },
    getViewParam(name) {
      if (!this.viewParams) {
        return;
      }
      return (
        this.viewParams &&
        this.viewParams.hasOwnProperty(name) &&
        this.viewParams[name]
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.design-inspector-controls {
  height: inherit;
  .toggle {
    width: auto;
  }
}
</style>
