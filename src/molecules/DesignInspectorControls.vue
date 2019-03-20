<template>
  <panel-control>
    <div class="design-inspector-controls">
      <toggle
        :active="showAllBlocks"
        :icon="(showFoundBlocks && 'target') || 'layers'"
        :text="(showFoundBlocks && 'Found layers') || 'All layers'"
        @click="toggleLayersViewMode"
      />
    </div>
  </panel-control>
</template>

<script>
import { mapGetters } from "vuex";
import Toggle from "../atoms/Toggle";
import PanelControl from "../atoms/PanelControl";
export default {
  name: "DesignInspectorControls",
  components: { PanelControl, Toggle },
  computed: {
    ...mapGetters(["viewParams"]),
    showAllBlocks() {
      return this.getParam("showAllDesignBlocks");
    },
    showFoundBlocks() {
      return this.getParam("showFoundDesignBlocks");
    }
  },
  methods: {
    toggleLayersViewMode() {
      if (!this.getParam("showAllDesignBlocks")) {
        this.setParam("showAllDesignBlocks", true);
      } else if (this.getParam("showFoundDesignBlocks")) {
        this.setParam("showAllDesignBlocks", false);
        this.setParam("showFoundDesignBlocks", false);
      } else {
        this.setParam("showFoundDesignBlocks", true);
      }
    },
    setParam(name, value) {
      if (!name) {
        return;
      }
      const param = {};
      param[name] = value;
      this.$store.dispatch("setViewParams", param);
    },
    getParam(name) {
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
