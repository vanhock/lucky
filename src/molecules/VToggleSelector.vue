<template>
  <div
    class="v-toggle-selector"
    :class="{ open: open }"
    :style="{ width: size, height: size }"
    @mouseenter="openSelector"
    @mouseleave="closeSelector"
  >
    <div class="v-toggle-selector-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  /** Tool-selector with bottom dropdown **/
  name: "VToggleSelector",
  created() {
    this.sortSlot();
    this.$children.forEach(children => {
      children.$on("changeActive", this.sortSlot());
    });
  },
  data: () => ({
    open: false,
    timeToOpen: 200,
    timer: null
  }),
  props: {
    size: { type: String, default: "45px" }
  },
  methods: {
    sortSlot() {
      this.$children.sort(a => {
        return a.active ? -1 : 0;
      });
    },
    openSelector() {
      const self = this;
      this.timer = setTimeout(() => {
        self.open = true;
      }, this.timeToOpen);
    },
    closeSelector() {
      this.timer && clearTimeout(this.timer);
      this.open = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.v-toggle-selector {
  &-container {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    margin-top: 0;
    border-radius: 30px;
    z-index: 10;
    padding: 10px 0 4px;
  }
  .v-toggle {
    padding: 8px 10px;
    border-radius: 50%;
    &:not(:first-child) {
      opacity: 1;
    }
    &:first-child {
      padding-top: 3px;
      &.active {
        opacity: 1;
      }
    }
  }
  &.open {
    .v-toggle-selector-container {
      background-color: $color-bg2;
      box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
      .v-toggle {
        opacity: 1;
      }
    }
  }
  &:not(.open) {
    .v-toggle:not(:first-child) {
      display: none;
    }
  }
}
</style>
