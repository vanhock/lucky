<template>
  <div class="card-table-list">
    <div class="title" v-if="title">{{ title }}</div>
    <div class="card-table-list-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "CardTableList",
  props: {
    title: String
  }
};
</script>

<style lang="scss">
.card-table-list {
  &-container {
    margin-top: 20px;
    .v-card {
      &:not(:last-child):not(:first-child) {
        .v-card-content {
          border-radius: 0;
        }
      }
      &:first-child:last-child {
        border-radius: 7px;
      }
      &:first-child:not(:last-child) {
        .v-card-content {
          border-radius: 7px 7px 0 0;
        }
      }
      &:last-child:not(:first-child) {
        .v-card-content {
          border-radius: 0 0 7px 7px;
        }
      }
      &:not(:last-child) {
        &:after {
          content: "";
          position: absolute;
          height: 1px;
          width: calc(100% - 40px);
          bottom: 0;
          @include galign();
          background-color: $color-b4;
        }
      }
      .v-card-content {
        cursor: default;
        .caption {
          position: absolute;
          bottom: 18px;
          margin: 0;
          padding: 0;
        }
        &:active {
          top: 0;
        }
      }
    }
  }
  .title {
    margin-top: 20px;
  }
}
</style>
