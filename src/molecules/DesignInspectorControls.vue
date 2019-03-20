<template>
  <panel-control>
    <div class="design-inspector-controls">
      <toggle
        :active="showAllBlocks"
        icon="layers"
        text="Layers"
        @click="setParam('showAllDesignBlocks', !showAllBlocks)"
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
      if (!this.viewParams) {
        return;
      }
      return (
        this.viewParams &&
        this.viewParams.hasOwnProperty("showAllDesignBlocks") &&
        this.viewParams.showAllDesignBlocks
      );
    }
  },
  methods: {
    setParam(name, value) {
      if (!name) {
        return;
      }
      const param = {};
      param[name] = value;
      this.$store.dispatch("setViewParams", param);
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
