<template>
  <div class="view-params">
    <panel-control>
      <v-toggle
        :active="syncScroll"
        icon="link"
        text="Sync scroll"
        @click="toggleSyncScroll"
        hide-text
      ></v-toggle>
      <panel-control :dropdown="true">
        <v-toggle
          icon="view-carousel"
          text="Change view"
          hide-text
        ></v-toggle>
        <template v-slot:dropdown>
          <v-menu>
            <menu-item>
              <v-toggle icon="border-horizontal" text="Split horizontal" />
            </menu-item>
            <menu-item>
              <v-toggle icon="border-vertical" text="Split vertical" />
            </menu-item>
            <menu-item>
              <v-toggle icon="browser-window-open" text="In new window" />
            </menu-item>
            <menu-item>
              <v-toggle icon="view-hide" text="Hide design view" />
            </menu-item>
          </v-menu>
        </template>
      </panel-control>
      <panel-control :dropdown="true">
        <v-toggle icon="tuning" text="Recognize settings" hide-text />
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
import ViewMixin from "../../mixins/ViewMixin";
import PanelControl from "../../atoms/PanelControl";
import VToggle from "../../atoms/VToggle";

import VMenu from "../../atoms/VMenu";
import MenuItem from "../../atoms/MenuItem";
import InputControl from "../InputControl";
export default {
  name: "ViewParams",
  mixins: [ViewMixin],
  components: { PanelControl, VToggle, VMenu, MenuItem, InputControl },
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
      this.$store.dispatch("PAGE_SET_VIEW_PARAMS", {
        syncScroll: !this.syncScroll
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.view-params {
  height: inherit;
  .v-toggle {
    width: auto;
  }
}
</style>
