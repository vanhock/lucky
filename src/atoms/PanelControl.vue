<template>
  <div
    class="panel-control"
    ref="panel"
    :class="{ 'dropdown-open': showDropdown }"
  >
    <div
      class="panel-control-content"
      @click="dropdown ? (showDropdown = !showDropdown) : ''"
    >
      <slot ref="toggle"></slot>
    </div>

    <div ref="dropdown" class="dropdown" v-if="dropdown" v-show="showDropdown">
      <div class="dropdown-content">
        <slot name="dropdown"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { parents } from "./utils";

export default {
  name: "PanelControl",
  mounted() {
    const self = this;
    if (!this.dropdown) {
      return;
    }
    this.$nextTick(() => {
      document.body.onclick = e => {
        if (
          e.target !== self.$refs.panel &&
          self.$refs.panel !== parents(e.target, "panel-control")
        ) {
          self.showDropdown = false;
        }
        e.stopPropagation();
      };
    });
  },
  data: () => ({
    showDropdown: false
  }),
  props: {
    dropdown: Boolean
  },
  methods: {
    closePanelDropdown() {}
  }
};
</script>

<style lang="scss" scoped>
.panel-control {
  position: relative;
  display: flex;
  height: 100%;
  &-content {
    display: flex;
    height: 100%;
  }
  &.dropdown-open {
    .toggle {
      opacity: 0.5;
    }
  }
  .dropdown {
    position: absolute;
    top: 31px;
    padding-top: 13px;
    @include galign();
    z-index: 11;
    &-content {
      position: relative;
      padding: 10px;
      background-color: $color-bg2;
      &:before {
        position: absolute;
        content: "";
        width: 0;
        height: 0;
        top: -7px;
        @include galign();
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 7px solid $color-bg2;
      }
    }
  }
}
</style>
