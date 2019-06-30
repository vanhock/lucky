<template>
  <div class="empty-placeholder" :class="{ transparent: transparent }">
    <div class="image" v-if="icon">
      <v-icon :icon="icon" :params="{ iconSize: '100px' }" />
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
    transparent: Boolean
  }
};
</script>

<style lang="scss" scoped>
.empty-placeholder {
  display: flex;
  width: 100%;
  min-height: 450px;
  margin: 0 auto;
  justify-content: center;
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
    max-width: 80%;
    max-height: 70px;
    overflow: hidden;
  }
  .text {
    margin-bottom: 20px;
  }
}
</style>
