<template>
  <div class="card-general-list">
    <div class="title" v-if="title">{{ title }}</div>
    <div class="card-general-list-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "CardGeneralList",
  props: {
    title: String
  }
};
</script>

<style lang="scss" scoped>
.card-general-list {
  .title {
    margin-top: 30px;
  }
  &-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    margin-top: 20px;
    justify-items: stretch;
    @media (max-width: 1400px) {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
}
</style>
