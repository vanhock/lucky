<template>
  <div class="trash-view">
    <v-button-primary @click="openModal('create')"
      >Empty trash</v-button-primary
    >
    <trash-list
      :trash="projectsTrash"
      title="Projects"
      @restore="restoreProject"
      @delete="deleteProject"
    />
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
export default {
  name: "TrashView",
  mixins: [UserPanelMixin],
  components: { TrashList, VButtonPrimary },
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
    ...mapGetters(["projectsTrash"])
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
    deleteProject(project) {
      this.$store
        .dispatch(TRASH_DELETE_PROJECT, project)
        .then(() => {
          notification(this, "success", "Project deleted permanently");
        })
        .catch(error => {
          notification(this, "error", error);
        });
    }
  }
};
</script>

<style scoped></style>
