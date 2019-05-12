<template>
  <v-input
    class="v-input-bordered"
    ref="input"
    :type="type"
    :name="name"
    :label="label"
    :value="value"
    :placeholder="placeholder"
    :required="required"
    :autocomplete="autocomplete"
    :disabled="disabled"
  />
</template>

<script>
import VInput from "../../atoms/VInput";
export default {
  name: "VInputBordered",
  components: { VInput },
  mounted() {
    const self = this;
    this.$refs.input.$on("onchange", () => {
      self.$emit("onchange");
    });
  },
  extends: VInput
};
</script>

<style lang="scss">
.v-input-bordered.v-input {
  .input {
    height: 50px;
    input {
      border: 1px solid $color-b4;
      border-radius: 3px;
      padding: 17px 10px 0;
      font-size: 14px;
      height: 100%;
      letter-spacing: 0.2px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      &[disabled] {
        opacity: 0.7;
      }
    }
  }
  .label {
    font-size: 15px;
    top: 15px;
    left: 10px;
    color: $color-b21;
    font-weight: 500;
  }
  &.focus {
    .label {
      top: 8px;
      font-size: 11px;
      color: $color-b3;
    }
  }
}
</style>
