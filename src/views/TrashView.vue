<template>
  <div class="trash-view">
    <v-button-primary @click="openModal('create')"
      >Empty trash</v-button-primary
    >
    <template>
      <div class="title">Projects</div>
    </template>
  </div>
</template>

<script>
import UserPanelMixin from "../mixins/UserPanelMixin";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";

export default {
  name: "TrashView",
  mixins: [UserPanelMixin],
  components: { VButtonPrimary },
  data: () => ({
    modals: {
      deleteAll: {
        title: "Empty all in trash",
        description: "All documents in trash will be deleted permanently!",
        action: "deleteAll",
        buttonName: "Empty trash"
      },
      deleteProject: {
        title: "Delete project",
        description: "The Project will be deleted permanently!",
        action: "deleteProject",
        buttonName: "Delete project"
      }
    },
    selectedModal: "deleteAll"
  })
};
</script>

<style scoped></style>
