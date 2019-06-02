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
    display: flex;
    flex-direction: column;
    & > .menu-item {
      &:not(:last-child) {
        padding-bottom: 5px;
      }
    }
    .menu-item {
      & > * {
        padding-left: 15px;
      }

      &.bottom {
        margin-top: auto;
      }

      .v-toggle {
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
          position: static;
          background-color: transparent;
          margin-left: 0;
          text-align: left;
          margin-top: 5px;
          padding-left: 0;
          font-size: 12px;
          font-weight: 500;
          color: $color-b3;
        }
      }
      &.has-submenu {
        position: relative;
      }
    }
    .menu.submenu {
      margin-bottom: 15px;
      .menu-item {
        position: relative;
        margin-left: -15px;
        padding-left: 25px;
        //background-color: #fff;
        border-radius: 0 5px 5px 0;
        .router-link {
          &:before {
            position: absolute;
            content: "";
            height: 3.5px;
            width: 3.5px;
            left: 25px;
            bottom: -5px;
            @include valign();
            background-color: $color-b3;
          }
          &-exact-active {
            &:before {
              background-color: $color-w3;
            }
          }
        }
        &:not(:last-child) {
          margin-bottom: 5px;
        }
        .v-toggle {
          padding: 0;
          .text {
            font-weight: 500;
            max-height: 30px;
            max-width: 100px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}
</style>
