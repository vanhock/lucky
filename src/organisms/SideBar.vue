<template>
  <div class="sidebar">
    <slot name="top"></slot>
    <dynamic-menu :items="menu" align="vertical" show-text />
    <slot name="bottom"></slot>
  </div>
</template>

<script>
import DynamicMenu from "../molecules/DynamicMenu";
export default {
  name: "SideBar",
  components: { DynamicMenu },
  props: {
    menu: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style lang="scss">
.sidebar {
  width: 95px;
  height: 100%;
  background-color: $color-bg1;
  &-container {
    height: 100%;
    width: 85%;
    margin: 0 auto;
  }
  .dynamic-menu {
    .toggle {
      &.active {
        color: #fff;
        .icon {
          fill: #fff;
        }
      }
      &:not(.active) {
        color: $color-b3;
        .icon {
          fill: $color-b3;
        }
        &:hover {
          color: #fff;
          .icon {
            fill: #fff;
          }
        }
      }
    }
  }
}
</style>
