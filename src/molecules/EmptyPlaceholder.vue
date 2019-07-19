<template>
  <div
    class="empty-placeholder"
    :class="[{ transparent: transparent }, alignment]"
    :style="{ minHeight: minHeight }"
  >
    <div class="image" v-if="icon">
      <v-icon :icon="icon" :params="{ iconSize: iconSize }" />
    </div>
    <div class="title">{{ title }}</div>
    <div class="text" v-if="text">{{ text }}</div>
    <slot></slot>
  </div>
</template>

<script>
import VIcon from "../atoms/VIcon/VIcon";
export default {
  name: "EmptyPlaceholder",
  components: { VIcon },
  props: {
    title: {
      type: String,
      default: function() {
        return this.$t("Have no data here");
      }
    },
    text: String,
    icon: String,
    iconSize: {
      type: String,
      default: "100px"
    },
    alignment: {
      type: String,
      default: "center"
    },
    transparent: Boolean,
    minHeight: String
  }
};
</script>

<style lang="scss" scoped>
.empty-placeholder {
  display: flex;
  width: 100%;
  min-height: 450px;
  margin: 0 auto;
  align-items: center;
  flex-direction: column;
  text-align: center;
  border-radius: 7px;

  &:not(.transparent) {
    background-color: #fff;
    @include box-shadow(medium);
  }

  .image {
    background-size: cover;
    pointer-events: none;
  }

  .title {
    font-size: 18px;
    margin: 25px 0 30px;
    max-width: 70%;
    max-height: 70px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .text {
    margin-bottom: 20px;
  }

  &.center {
    justify-content: center;
  }

  &.top {
    justify-content: flex-start;
  }

  &.bottom {
    justify-content: flex-end;
  }
}
</style>
