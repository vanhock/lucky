<template>
  <div class="trash-view">
    <template v-if="trashLength">
      <v-button-primary @click="openModal('create')"
        >Empty trash</v-button-primary
      >
      <trash-list
        :trash="projectsTrash"
        title="Projects"
        @restore="restoreProject"
        @delete="openModal('deleteProject', $event)"
      />
      <v-modal
        ref="operationalModal"
        class="operational-modal"
        :title="currentModalTitle"
        :description="currentModalDescription"
      >
        <v-button-primary @click="currentAction">{{
          currentModalButtonName
        }}</v-button-primary>
      </v-modal>
    </template>
    <template v-if="!trashLength">
      <empty-placeholder title="Trash is empty" icon="garbage" />
    </template>
  </div>
</template>

<script>
import UserPanelMixin from "../mixins/UserPanelMixin";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import {
  TRASH_DELETE_PROJECT,
  TRASH_GET_PROJECTS_TRASH,
  TRASH_RESTORE_PROJECT
} from "../services/store/mutation-types";
import { notification } from "../services/notification";
import TrashList from "../organisms/TrashList";
import { mapGetters } from "vuex";
import VModal from "../molecules/VModal";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
export default {
  name: "TrashView",
  mixins: [UserPanelMixin],
  components: {EmptyPlaceholder, TrashList, VButtonPrimary, VModal },
  created() {
    this.getProjectsTrash();
  },
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
  computed: {
    ...mapGetters(["projectsTrash"]),
    trashLength() {
      return this.projectsTrash.length;
    }
  },
  methods: {
    getProjectsTrash() {
      this.$store.dispatch(TRASH_GET_PROJECTS_TRASH);
    },
    restoreProject(project) {
      this.$store
        .dispatch(TRASH_RESTORE_PROJECT, project)
        .then(() => {
          notification(this, "success", "Project restored");
        })
        .catch(error => {
          notification(this, "error", error);
        });
    },
    deleteProject() {
      this.$store
        .dispatch(TRASH_DELETE_PROJECT, this.dataForOperations)
        .then(() => {
          notification(this, "success", "Project deleted permanently");
          this.$refs.operationalModal.showModal = false;
        })
        .catch(error => {
          notification(this, "error", error);
          this.$refs.operationalModal.showModal = false;
        });
    }
  }
};
</script>

<style scoped></style>
