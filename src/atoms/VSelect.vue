<template>
  <div class="v-select">
    <div class="label" v-if="label">
      <label :for="`select-${name}`">{{ label }}</label>
    </div>
    <div class="value" :class="{ disabled: disabled }">
      <div class="selected">{{ selectedItem.name }}</div>
      <select
        @change="$emit('change', { [name]: selectedItem.value })"
        v-model="selectedItem"
        :id="id || `select-${name}`"
        :ref="`select-${name}`"
        :disabled="disabled"
      >
        <option
          v-for="(option, index) in options"
          :key="index"
          :value="option"
          :data-index="index"
          :class="{ 'selected-option': option.value === selectedItem.value }"
          :disabled="option.disabled"
        >
          {{ option.name }}</option
        >
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: "VSelect",
  created() {
    const self = this;
    this.selectedItem =
      (this.options &&
        this.options.length &&
        (this.options.filter(item => item.value === self.value)[0] ||
          this.options[0])) ||
      {};
  },
  data: () => ({
    selectedItem: ""
  }),
  props: {
    name: {
      type: String,
      required: true
    },
    id: String,
    label: {
      type: String
    },
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: [String, Number]
    },
    disabled: Boolean
  }
};
</script>
<style lang="scss">
.v-select {
  display: flex;
  align-items: center;
  font-size: 14px;
  .label {
    font-weight: 600;
    color: $color-b3;
    margin-right: 10px;
  }
  .value {
    position: relative;
    padding-right: 10px;
    &:not(.disabled) {
      cursor: pointer;
      &:after {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
        right: 0;
        @include valign();
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid $color-b2;
      }
    }
    &.disabled {
      pointer-events: none;
    }

    .selected {
      visibility: hidden;
    }
    .selected-option {
      display: none;
    }
    select {
      position: absolute;
      overflow: hidden;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      margin: 0;
      border: 0;
      background-color: transparent;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      outline: none;
      color: $color-b3;
      cursor: pointer;

      option {
        &[disabled] {
          color: $color-b4;
        }
      }
    }
  }
}
</style>
