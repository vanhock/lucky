<template>
  <div class="v-input-bordered">
    <v-input
      :type="type"
      :name="name"
      :label="label"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
import VInput from "../../atoms/VInput";
export default {
  name: "VInputWithoutBorder",
  components: { VInput },
  extends: VInput
};
</script>

<style lang="scss">
.v-input-bordered {
  .v-input {
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
      }
    }
    .label {
      font-size: 15px;
      top: 16px;
      left: 10px;
      color: $color-b4;
      font-weight: 500;
    }
    &.focused {
      .label {
        top: 9px;
        font-size: 11px;
        color: $color-b3;
      }
    }
  }
}
</style>
