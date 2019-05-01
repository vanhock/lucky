<template>
  <div class="v-card">
    <div class="v-card-image-container" v-if="image">
      <img class="image" :src="image" :alt="name" />
    </div>
    <div class="v-card-text-container">
      <div class="name">{{ name }}</div>
      <div class="caption">{{ caption }}</div>
      <div class="text">{{ text }}</div>
      <div class="actions"><slot></slot></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VCard",
  props: {
    name: {
      type: String,
      required: true
    },
    image: String,
    caption: String,
    text: String
  }
};
</script>

<style lang="scss" scoped>
.v-card {
  border-radius: 5px;
  @include box-shadow(medium);
  will-change: box-shadow, background-color;
  transition: box-shadow, background-color 0.1s ease-out;
  cursor: pointer;
  background-color: #fff;
  &-image-container {
    position: relative;
    display: flex;
    height: 250px;
    img {
      width: auto;
    }
  }
  &-text-container {
    display: flex;
    flex-direction: column;
    padding: 20px 20px 0;
    height: 145px;
    box-sizing: border-box;
    & > * {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
    .actions {
      display: flex;
      margin-top: auto;
      margin-left: auto;
    }
  }
  &:hover {
    background-color: $color-base;
    @include box-shadow(deep);
  }
}
</style>
