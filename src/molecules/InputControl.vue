<template>
  <div class="input-control">
    <div class="title" v-if="title">{{ title }}</div>
    <label>
      <v-toggle
        v-if="showPlusMinus"
        icon="minus-outline"
        icon-hover="minus-solid"
        @click="inputValue > 0 && --inputValue"
      />
      <input type="text" v-model="inputValue" />
      <v-toggle
        v-if="showPlusMinus"
        icon="add-outline"
        icon-hover="add-solid"
        @click="++inputValue"
      />
    </label>
  </div>
</template>

<script>
import _ from "lodash";
import VToggle from "../atoms/VToggle";
export default {
  name: "InputControl",
  components: { VToggle },
  mounted() {
    this.inputValue = this.value;
  },
  data: () => ({
    inputValue: 0
  }),
  watch: {
    inputValue: _.debounce(function(value) {
      this.$emit("changeValue", parseInt(value));
    }, 300)
  },
  props: {
    title: String,
    value: {
      type: Number,
      default: 0
    },
    showPlusMinus: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped>
.input-control {
  min-width: 104px;
  .title {
    color: $color-b5;
    font-size: 11px;
    width: 100%;
    margin-bottom: 7px;
  }
  label {
    width: 100px;
    display: flex;
    input {
      width: 100%;
      margin: 0 4px;
      background-color: #000;
      color: #fff;
      padding: 2px 5px 0;
      text-align: center;
    }
    .v-toggle {
      padding: 0 5px;
    }
  }
}
</style>
