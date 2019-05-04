<template> </template>

<script>
export default {
  name: "UserPanelMixin",
  data: () => ({
    currentAction: null,
    dataForOperations: {}
  }),
  computed: {
    currentModalTitle() {
      return this.modals && this.modals[this.selectedModal].title;
    },
    currentModalDescription() {
      return this.modals && this.modals[this.selectedModal].description;
    },
    currentModalButtonName() {
      return this.modals && this.modals[this.selectedModal].buttonName;
    },
    selectedName() {
      return this.dataForOperations && this.dataForOperations.name;
    }
  },
  methods: {
    openModal(action, data) {
      if (data) {
        this.dataForOperations = data;
      } else {
        this.dataForOperations = {};
      }
      this.selectedModal = action;
      this.$refs.operationalModal.showModal = true;
      const actionName = this.modals[this.selectedModal].action;
      if (typeof this[actionName] === "function") {
        this.currentAction = this[actionName];
      }
    }
  }
};
</script>

<style lang="scss">
.operational-modal {
  button {
    margin-top: 25px;
  }
}
</style>
