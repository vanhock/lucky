<template>
  <div class="sidebar" :class="appTheme">
    <div class="logo">
      <img src="/logo.png" style="width: 104px" alt="PerfectPixel" />
    </div>
    <slot name="top"></slot>
    <dynamic-menu :items="menu" align="vertical" show-text />
    <slot name="bottom"></slot>
  </div>
</template>

<script>
import DynamicMenu from "../molecules/DynamicMenu";
import { mapState } from "vuex";
import VIcon from "../atoms/VIcon/VIcon";
export default {
  name: "SideBar",
  components: { VIcon, DynamicMenu },
  props: {
    menu: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState(["appTheme"])
  }
};
</script>

<style lang="scss">
.sidebar {
  width: 120px;
  height: 100%;
  .logo {
    height: 81px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 13px;
  }
  &-container {
    height: 100%;
    width: 85%;
    margin: 0 auto;
  }
  &.dark {
    background-color: $color-bg1;
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
      [disabled] {
        .toggle {
          opacity: 0.4;
        }
      }
    }
  }
  &.white {
    .dynamic-menu {
      .toggle {
        &.active {
          color: $color-w3;
          .icon {
            fill: $color-w3;
          }
        }
        &:not(.active) {
          color: $color-b3;
          .icon {
            fill: $color-b3;
          }
          &:hover {
            color: $color-w4;
            .icon {
              fill: $color-w4;
            }
          }
        }
      }
      [disabled] {
        .toggle {
          opacity: 0.4;
        }
      }
    }
  }
}
</style>
