<template>
  <div class="v-card">
    <div class="v-card-content">
      <div class="v-card-image-container" v-if="image">
        <img class="image" :src="image" :alt="name" />
      </div>
      <div class="v-card-text-container">
        <div class="name">{{ name }}</div>
        <div class="text">{{ text }}</div>
        <div class="caption">{{ caption }}</div>
      </div>
    </div>
    <div class="actions"><slot></slot></div>
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
  position: relative;
  &-content {
    position: relative;
    border-radius: 5px;
    @include box-shadow(medium);
    will-change: box-shadow, background-color;
    transition: box-shadow 0.2s ease-out;
    cursor: pointer;
    background-color: #fff;
    &:hover {
      background-color: $color-base;
      @include box-shadow(deep);
    }
    &:active {
      top: 1px;
    }
  }
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
    height: 190px;
    box-sizing: border-box;
    margin-top: auto;
    & > * {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
    .name {
      font-weight: bold;
    }
    .caption {
      margin: auto 0 17px;
      padding-right: 40px;
      font-weight: 600;
      color: $color-b4;
      font-size: 11px;
    }
    .text {
      font-size: 12px;
      font-weight: 500;
      color: $color-b3;
    }
  }
  .actions {
    position: absolute;
    right: 5px;
    bottom: 0;
    display: flex;
    margin-top: auto;
    margin-left: auto;

    & > * {
      cursor: pointer;
    }
  }
}
</style>
