<template>
  <div class="menu" :class="align">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "VMenu",
  props: {
    align: {
      type: String,
      default: "horizontal"
    }
  }
};
</script>

<style lang="scss">
.menu {
  display: block;
  &.horizontal {
    .menu-item {
      padding: 4px 10px;
    }
  }
  &.vertical {
    & > .menu-item {
      &:not(:last-child) {
        padding-bottom: 5px;
      }
    }
    .menu-item {
      & > * {
        padding-left: 15px;
      }

      .toggle {
        justify-content: flex-start;
        align-items: center;
        text-align: center;
        padding: 14px 0;
        .icon {
          width: 24px;
          height: 25px;
          margin-right: 12px;
        }
        .text {
          font-size: 14px;
          margin-left: 0;
        }
        .label {
          background-color: transparent;
          margin-left: 0;
          text-align: left;
          margin-top: 5px;
          padding-left: 0;
        }
      }
      &.has-submenu {
        position: relative;
      }
    }
    .menu.submenu {
      .menu-item {
        position: relative;
        margin-left: -15px;
        padding-left: 12px;
        &:not(:last-child) {
          margin-bottom: 5px;
          &:before {
            position: absolute;
            content: "";
            height: 1px;
            width: 10px;
            left: 15px;
            bottom: -5px;
            @include valign();
            background-color: $color-b41;
          }
        }
        .toggle {
          padding: 0;
          .text {
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
