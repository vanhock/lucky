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
    .menu-item {
      padding: 0;
      .toggle {
        flex-direction: column;
        justify-content: center;
        text-align: center;
        padding: 14px 0;
        .icon {
          width: 24px;
          height: 25px;
        }
        .text {
          margin: 7px 0 0;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
