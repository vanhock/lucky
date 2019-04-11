<template>
  <div class="view-params">
    <panel-control>
      <toggle
        :active="syncScroll"
        icon="link"
        text="Sync scroll"
        @click="toggleSyncScroll"
        :show-text="false"
      ></toggle>
      <toggle icon="view-carousel" text="Change view" :show-text="false"></toggle>
      <toggle icon="refresh" text="Reload view" @click="$emit('reloadView')" />
      <panel-control :dropdown="true">
        <toggle icon="tuning" text="Recognize settings" />
        <template v-slot:dropdown>
          <v-menu>
            <menu-item>
              <input-control
                title="Sizes gutter"
                :value="recognizeSettings.sizesGutter"
                @changeValue="
                  value => {
                    setViewParam('sizesGutter', value);
                  }
                "
              />
            </menu-item>
            <menu-item>
              <input-control
                title="Position gutter"
                :value="recognizeSettings.positionGutter"
                @changeValue="
                  value => {
                    setViewParam('positionGutter', value);
                  }
                "
              />
            </menu-item>
          </v-menu>
        </template>
      </panel-control>
    </panel-control>
  </div>
</template>

<script>
import ViewMixin from "../mixins/ViewMixin";
import PanelControl from "../atoms/PanelControl";
import Toggle from "../atoms/Toggle";

import VMenu from "../atoms/Menu";
import MenuItem from "../atoms/MenuItem";
import InputControl from "../molecules/InputControl";
export default {
  name: "ViewParams",
  mixins: [ViewMixin],
  components: { PanelControl, Toggle, VMenu, MenuItem, InputControl },
  computed: {
    syncScroll() {
      return this.getViewParam("syncScroll");
    },
    recognizeSettings() {
      return {
        sizesGutter: this.getViewParam("sizesGutter") || 40,
        positionGutter: this.getViewParam("positionGutter") || 100
      };
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
