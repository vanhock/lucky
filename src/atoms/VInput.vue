<template>
  <div class="v-input" :class="[appTheme, { focused: focused }]">
    <div class="label">
      <label :for="`input-${name}`">{{ label }}</label>
    </div>
    <div class="input">
      <div class="validation-message" v-if="!valid">
        {{ validationMessage }}
      </div>
      <input
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :id="`input-${name}`"
        v-bind="$listeners"
        v-model="inputValue"
        :class="{ valid: changed && valid, invalid: changed && !valid }"
        @keyup="$emit('onchange')"
        @past="$emit('onchange')"
        @focus="onFocus"
        @blur="onBlur"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
/** Mixins: **/
import InputMixin from "../mixins/InputMixin.vue";
import InputValidationMixin from "../mixins/InputValidationMixin.js";
import InputMaskMixin from "../mixins/InputMaskMixin.js";

export default {
  name: "InputGeneral",
  mixins: [InputMixin, InputValidationMixin, InputMaskMixin],
  data: () => ({
    /** from InputMixin **/
    componentType: "general",
    focused: false
  }),
  computed: {
    ...mapState(["appTheme"])
  },
  props: {
    /** from InputMixin **/
  },
  methods: {
    onFocus() {
      this.focused = true;
    },
    onBlur() {
      this.inputValue === "" ? (this.focused = false) : "";
    }
  }
};
</script>

<style lang="scss">
.v-input {
  position: relative;
  display: block;
  font-size: 18px;
  @include clearfix();
  .input {
    width: 100%;
    font-size: 24px;
    input {
      width: calc(100% - 10px);
      padding: 3px 10px 3px 6px;
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
    .validation-message {
      position: absolute;
      right: 46px;
      top: -20px;
      font-size: 12px;
      color: $color-red;
    }
  }
  .label {
    font-size: 21px;
    font-weight: 300;
    left: 5px;
    pointer-events: none;
    position: absolute;
    top: 0;
    transition: 0.2s;
    user-select: none;
    white-space: nowrap;
    color: $color-b3;
  }
  &.focused {
    .label {
      font-size: 14px;
      top: -20px;
      color: $color-b4;
    }
  }
  &.white {
    .label,
    input {
      color: $color-b2;
    }
  }
  &.black {
    .label,
    input {
      color: #fff;
    }
  }
}
</style>
