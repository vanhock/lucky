<template>
  <div class="v-textarea" :class="[currentTheme, { focus: focus }]">
    <div class="label">
      <label :for="`textarea-${name}`">{{ label }}</label>
    </div>
    <div class="input">
      <div class="validation-message" v-if="!valid && focused">
        {{ $t("required") }}
      </div>
      <textarea
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :id="id || `textarea-${name}`"
        :ref="`textarea-${name}`"
        v-bind="$listeners"
        v-model="inputValue"
        :class="{ valid: changed && valid, invalid: changed && !valid }"
        @keyup="onChange"
        @past="onChange"
        @focus="onFocus"
        @blur="onBlur"
        :disabled="disabled"
        :autocomplete="autocomplete"
      ></textarea>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
/** Mixins: **/
import InputMixin from "../mixins/InputMixin.vue";
import InputValidationMixin from "../mixins/InputValidationMixin.js";
import InputMaskMixin from "../mixins/InputMaskMixin.js";

export default {
  name: "VTextarea",
  mixins: [InputMixin, InputValidationMixin, InputMaskMixin],
  data: () => ({
    /** from InputMixin **/
    componentType: "general",
    focus: false,
    focused: false
  }),
  mounted() {
    if (this.value && this.value.length) {
      this.focus = true;
    }
  },
  computed: {
    ...mapState(["appTheme"]),
    currentTheme() {
      return (this.theme && this.theme) || this.appTheme;
    }
  },
  props: {
    /** from InputMixin **/
    autocomplete: String,
    theme: String
  },
  methods: {
    onChange: _.debounce(function() {
      console.log("Emit textarea onchange ");
      this.$emit("onchange");
    }, 300),
    onFocus() {
      this.focus = true;
    },
    onBlur() {
      this.inputValue === "" ? (this.focus = false) : "";
      this.focused = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.v-textarea {
  position: relative;
  display: block;
  font-size: 18px;
  @include clearfix();
  .input {
    width: 100%;
    font-size: 24px;
    textarea {
      max-width: 100%;
      min-height: 100px;
      max-height: 200px;
      border-bottom-color: $color-b3;
      background-color: transparent;
      color: #fff;
      border: 1px solid $color-b4;
      border-radius: 3px;
      padding: 25px 10px 0;
      font-size: 14px;
      height: 100%;
      letter-spacing: 0.2px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      &[disabled] {
        opacity: 0.7;
      }

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
      right: 10px;
      top: 10px;
      font-size: 10px;
      color: $color-red;
    }
  }
  .label {
    pointer-events: none;
    position: absolute;
    transition: 0.2s;
    user-select: none;
    white-space: nowrap;
    font-size: 15px;
    top: 15px;
    left: 10px;
    color: $color-b21;
    font-weight: 500;
    will-change: top, font-size;
  }
  &.focus {
    .label {
      top: 8px;
      font-size: 11px;
      color: $color-b3;
    }
  }
  &.white {
    .label,
    textarea {
      color: $color-b2;
    }
    &.focus {
      .label {
        color: $color-b3;
      }
    }
  }
  &.dark {
    .label,
    textarea {
      color: #fff;
    }
  }
}
</style>
