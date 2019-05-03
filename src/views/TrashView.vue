<template>
  <div class="trash-view">
    <v-button-primary @click="openModal('create')"
      >Empty trash</v-button-primary
    >
  </div>
</template>

<script>
import UserPanelMixin from "../mixins/UserPanelMixin";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import {TRASH_GET_PROJECTS_TRASH, TRASH_RESTORE_PROJECT} from "../services/store/mutation-types";
import { notification } from "../services/notification";

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
  }),
  methods: {
    getProjectsTrash() {
      this.$store.dispatch(TRASH_GET_PROJECTS_TRASH);
    },
    restoreProject() {
      this.$store
        .dispatch(TRASH_RESTORE_PROJECT)
        .then(() => {
          notification(this, "success", "Project restored");
        })
        .catch(error => {
          notification(this, "error", error);
        });
    },
    deleteProject() {
      this.$store.dispatch(PROJECT_)
    }
  }
};
</script>

<style scoped></style>
