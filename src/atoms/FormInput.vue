<template>
  <div class="form-item-general">
    <div class="label">
      <label :for="`input-${name}`">{{ label }}</label>
    </div>
    <div class="input">
      <div class="validation-message" v-if="!valid">
        {{ validationMessage }}
      </div>
      <input
        :class="{ valid: changed && valid, invalid: changed && !valid }"
        v-model="inputValue"
        :type="type"
        :id="`input-${name}`"
        :name="name"
        :placeholder="placeholder"
        @keyup="$emit('onchange')"
        @past="$emit('onchange')"
        v-bind="$props"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script>
/** Mixins: **/
import InputMixin from "../mixins/InputMixin.vue";
import InputValidationMixin from "../mixins/InputValidationMixin.js";
import InputMaskMixin from "../mixins/InputMaskMixin.js";

export default {
  name: "InputGeneral",
  mixins: [InputMixin, InputValidationMixin, InputMaskMixin],
  data: () => ({
    /** from InputMixin **/
    componentType: "general"
  }),
  props: {
    /** from InputMixin **/
  }
};
</script>

<style lang="scss" scoped>
.form-item-general {
  display: block;
  font-size: 18px;
  @include clearfix();
  .input {
    width: 100%;
    font-size: 24px;
    input {
      width: calc(100% - 10px);
      padding: 3px 10px 3px 0;
      border: 0;
      border-bottom: 2px solid;
      border-bottom-color: $color-b3;
      background-color: transparent;
      color: #fff;
      &:focus {
        border-bottom-color: $color-b4;
      }
      &.valid {
        border-bottom-color: $color-green;
      }
      &.invalid {
        border-bottom-color: $color-w1;
      }
      &[disabled] {
        border-color: transparent;
      }
    }
  }
  .label {
    display: flex;
    align-items: flex-end;
    text-align: left;
    width: 190px;
    color: #fff;
    margin-right: 5px;
    margin-bottom: 5px;
    float: left;
  }
}
</style>
