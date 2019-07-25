<template>
  <div class="v-input-search">
    <v-input
      ref="input"
      :type="type"
      :id="id"
      :name="name"
      :value="value"
      :label="label"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :validation-message="validationMessage"
      :disabled="disabled"
      :theme="theme"
      autofocus
      @onchange="onchange"
    />
    <v-button-inline
      class="v-input-search-submit"
      :disabled="!isValid"
      @click="onclick"
    >
      <v-icon
        v-if="!noIcon"
        mode="feather"
        :icon="buttonIcon"
        :params="{ iconSize: '28px' }"
      />
      <span>{{ buttonText }}</span>
    </v-button-inline>
    <div class="v-input-select" v-if="showSelect">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import VInput from "../../atoms/VInput";
import VIcon from "../../atoms/VIcon/VIcon";
import VButtonInline from "../VButton/VButtonInline";
export default {
  name: "VInputSearch",
  components: { VButtonInline, VIcon, VInput },
  mounted() {
    const self = this;
    this.$refs.input.$on("onchange", data => {
      self.currentValue = data.value;
      self.isValid = data.valid;
      self.$emit("onchange", data);
    });
  },
  data: () => ({
    showSelect: false,
    currentValue: "",
    isValid: false,
  }),
  extends: VInput,
  props: {
    items: {
      type: Array,
      default: () => []
    },
    buttonText: String,
    buttonIcon: {
      type: String,
      default: "arrow-right-circle"
    },
    noIcon: Boolean
  },
  methods: {
    onclick() {
      this.$emit("onclick");
    },
    onchange(value, valid, event) {
      console.log(event);
      this.$emit("onchange");
    },
    clear() {
      this.$refs.input.clearValue();
    }
  }
};
</script>

<style lang="scss">
.v-input-search {
  position: relative;
  .v-input {
    max-width: calc(100% - 75px);
    .input {
      width: 80%;
      input {
        border-bottom: 0;
        padding: 10px 20px;
        box-sizing: border-box;
      }
      .validation-message {
        @include valign();
      }
    }
  }
  &-submit {
    position: absolute;
    right: 0;
    padding: 8px 20px;
    @include valign();
    span {
      margin-top: 1px;
      margin-left: 7px;
    }
  }
}
</style>
