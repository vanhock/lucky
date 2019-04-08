<template>
  <div class="view-params">
    <panel-control>
      <toggle icon="refresh" text="Reload view" @click="$emit('reloadView')" />
      <toggle icon="view-carousel" text="Change view"></toggle>
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
import PanelControl from "../atoms/PanelControl";
import Toggle from "../atoms/Toggle";
import ViewMixin from "../mixins/ViewMixin";

export default {
  name: "ViewParams",
  mixins: [ViewMixin],
  components: { PanelControl, Toggle },
  computed: {
    syncScroll() {
      return this.getViewParam("syncScroll");
    }
  },
  methods: {
    toggleSyncScroll() {
      this.$store.dispatch("setViewParams", { syncScroll: !this.syncScroll });
    }
  }
};
</script>

<style lang="scss" scoped>
.view-params {
  height: inherit;
  .toggle {
    width: auto;
  }
}
</style>
