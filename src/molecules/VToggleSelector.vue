<template>
  <div
    class="v-toggle-selector"
    :class="{ open: open }"
    :style="{ width: size }"
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
  name: "VToggleSelector",
  created() {
    this.sortSlot();
    this.$children.forEach(children => {
      children.$on("changeActive", this.sortSlot());
    });
  },
  data: () => ({
    open: false,
    timeToOpen: 300,
    timer: null
  }),
  props: {
    size: { type: String, default: "64px" }
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
  border-radius: 30px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  &-container {
    display: flex;
    flex-direction: column;
  }
  .v-toggle {
    padding: 13px;
  }
  &.open {
    background-color: $color-bg2;
    @include box-shadow(medium);
    .v-toggle {
      &:first-child {
        border-radius: 30px 30px 0 0;
      }
      &:last-child {
        border-radius: 0 0 30px 30px;
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
