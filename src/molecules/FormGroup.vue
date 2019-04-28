<template>
  <form
    class="form-group"
    ref="thisFormGroup"
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
    this.$children.forEach(children => {
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
    changedItems: {}
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
    },
    resetFormGroup() {
      this.$children.forEach(child => {
        child.resetValue();
      });
      this.changedItemsArray = [];
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
