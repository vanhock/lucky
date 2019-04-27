<template>
  <section
    class="form-group"
    ref="thisFormGroup"
    :class="{ changed: childrenChanged }"
  >
    <div class="form-items">
      <slot v-if="!parentLoading"></slot>
    </div>
  </section>
</template>

<script>
export default {
  name: "FormGroup",
  mounted() {
    /*this.$children.forEach(children => {
      children.$on("inputChanged", this.handleChildrenChanged);
    });*/
	  this.$children[0].$on('inputChanged', this.handleChildrenChanged)
  },
  beforeDestroy() {
    /*this.$children.forEach(children => {
      children.$off("inputChanged", this.handleChildrenChanged);
    });*/
	  this.$children[0].$on('inputChanged', this.handleChildrenChanged)
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
        .filter(children => children.changed)
        .map(item => {
          object[item.name] = item.inputValue;
          return {
            name: item.name,
            value: item.inputValue
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
