<template>
  <form
    class="form-group"
    ref="thisFormGroup"
    :class="{ changed: childrenChanged }"
  >
    <div class="form-items">
      <slot v-if="!parentLoading"></slot>
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
      this.changedItemsArray = this.$children
        .filter(children => children.$children[0].changed)
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
    }
  }
};
</script>
