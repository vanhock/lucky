<template>
  <div class="v-card">
    <div class="v-card-image-container">
      <img class="image" v-if="image" :src="image" :alt="name" />
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
  height: 180px;
  border-radius: 5px;
  @include box-shadow(deep);
  will-change: box-shadow, background-color;
  &-image-container {
    position: relative;
    display: flex;
    img {
      width: auto;
    }
  }
}
</style>
