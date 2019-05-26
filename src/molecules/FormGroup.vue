<template>
  <form
    class="form-group"
    ref="thisFormGroup"
    @submit.prevent="$emit('submit')"
    :class="{ changed: childrenChanged, loading: loading }"
  >
    <div class="form-items">
      <slot></slot>
    </div>
  </form>
</template>

<script>
export default {
  name: "FormGroup",
  mounted() {
    this.$children.forEach((children, index) => {
      if (index === 0) {
        const targetEl = children.$el.querySelector("input:not([disabled])");
        targetEl && targetEl.focus();
      }
      children.$on("onchange", this.handleChildrenChanged);
    });
  },
  beforeDestroy() {
    this.$children.forEach(children => {
      children.$off("onchange", this.handleChildrenChanged);
    });
  },
  data: () => ({
    name: "FormGroup",
    changedItemsArray: [],
    changedItems: {},
    allItems: {}
  }),
  props: {
    editableMode: Boolean,
    loading: Boolean
  },
  computed: {
    parentLoading() {
      return this.$parent && this.$parent.loading;
    },
    childrenChanged() {
      return this.changedItemsArray && this.changedItemsArray.length;
    },
    valid() {
      if (!this.childrenChanged) {
        return false;
      }
      return (
        this.changedItemsArray.length ===
        this.changedItemsArray.filter(item => item.valid).length
      );
    }
  },
  methods: {
    handleChildrenChanged() {
      console.log("form children changed");
      const object = {};
      const self = this;
      this.changedItemsArray = this.$children
        .filter(children =>
          self.editableMode ? children.$children[0].changed : true
        )
        .map(item => {
          object[item.$children[0].name] = item.$children[0].inputValue;
          return {
            name: item.$children[0].name,
            value: item.$children[0].inputValue,
            valid: item.$children[0].valid
          };
        });
      this.changedItems = object;

      this.$children.forEach(item => {
        this.allItems[item.$children[0].name] =
          item.$children[0].inputValue !== ""
            ? item.$children[0].inputValue
            : item.$children[0].value;
      });
    },
    getFormChangedFields() {
      this.handleChildrenChanged();
      return this.changedItems;
    },
    getFormFields() {
      this.handleChildrenChanged();
      return this.allItems;
    },
    resetFormGroup() {
      this.$children.forEach(child => {
        child.resetValue();
      });
      this.changedItemsArray = [];
      this.changedItems = {};
    },
    clearFormGroup() {
      this.$children.forEach(child => {
        child.clearValue();
      });
      this.changedItemsArray = [];
      this.changedItems = {};
      this.allItems = {};
    },
    showValidation() {
      this.$children.forEach(child => {
        child.$children[0].focused = true;
      });
    }
  }
};
</script>
<style lang="scss">
.form-group {
  &.loading {
    input {
      opacity: 0.7;
      pointer-events: none;
    }
  }
}
</style>
