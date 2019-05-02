<template>
  <div class="projects-view">
    <template v-if="hasProjects">
      <v-button-primary @click="openModal('create')"
        >New project</v-button-primary
      >
      <div class="title">
        Active projects
      </div>
      <projects-list
        :projects="projects"
        @delete="deleteProject"
        @edit="openModal('edit', $event)"
      />
    </template>
    <template v-if="!hasProjects">
      <empty-placeholder title="Have no projects yet" icon="project">
        <v-button-primary @click="openModal('create')"
          >New project</v-button-primary
        >
      </empty-placeholder>
    </template>
    <v-modal
      ref="newProjectModal"
      class="project-operational-modal"
      :title="currentModalTitle"
      @open="setFocus"
    >
      <form-group ref="createProjectForm">
        <v-input-clear
          id="projectName"
          name="name"
          :value="selectedProjectName"
          label="Project title"
          required
        />
      </form-group>
      <v-button-primary @click="currentAction">{{
        currentModalButtonName
      }}</v-button-primary>
    </v-modal>
  </div>
</template>

<script>
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import ProjectsList from "../organisms/ProjectsList";
import VModal from "../molecules/VModal";
import FormGroup from "../molecules/FormGroup";
import VInputClear from "../molecules/VInput/VInputClear";
import { mapGetters } from "vuex";
import {
  PROJECT_CREATE_PROJECT,
  PROJECT_EDIT_PROJECT,
  PROJECT_GET_ALL_PROJECTS
} from "../services/store/mutation-types";
import { notification } from "../services/notification";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
export default {
  name: "ProjectsView",
  mounted() {
    this.getAllProjects();
  },
  components: {
    EmptyPlaceholder,
    VInputClear,
    FormGroup,
    VModal,
    ProjectsList,
    VButtonPrimary
  },
  data: () => ({
    modals: {
      create: {
        title: "Create project",
        action: "createProject",
        buttonName: "Create"
      },
      edit: {
        title: "Edit project",
        action: "editProject",
        buttonName: "Save"
      }
    },
    selectedModal: "create",
    currentAction: null,
    projectForOperations: {}
  }),
  computed: {
    ...mapGetters(["projects", "hasProjects"]),
    currentModalTitle() {
      return this.modals && this.modals[this.selectedModal].title;
    },
    currentModalButtonName() {
      return this.modals && this.modals[this.selectedModal].buttonName;
    },
    selectedProjectName() {
      return this.projectForOperations && this.projectForOperations.name;
    }
  },
  methods: {
    createProject() {
      if (!this.$refs.createProjectForm.valid) {
        return notification(
          this,
          "error",
          "Project name did not provide or not valid!"
        );
      }
      this.$store
        .dispatch(
          PROJECT_CREATE_PROJECT,
          this.$refs.createProjectForm.changedItems
        )
        .then(project => {
          this.$refs.newProjectModal.showModal = false;
          return notification(
            this,
            "success",
            `Project "${project.name}" successfully created!`
          );
        })
        .catch(error => notification(this, "error", error));
    },
    getAllProjects() {
      this.$store
        .dispatch(PROJECT_GET_ALL_PROJECTS)
        .then(() => {})
        .catch(error => notification(this, "error", error));
    },
    editProject() {
      if (!this.$refs.createProjectForm.childrenChanged) {
        return;
      }
      if (!this.$refs.createProjectForm.valid) {
        return notification(
          this,
          "error",
          "Project name did not provide or not valid!"
        );
      }
      this.$store
        .dispatch(PROJECT_EDIT_PROJECT, {
          ...this.$refs.createProjectForm.changedItems,
          id: this.projectForOperations.id
        })
        .then(() => {
          this.$refs.newProjectModal.showModal = false;
          return notification(this, "success", "Project successfully edited");
        })
        .then(error => notification(this, "error", error));
    },
    deleteProject() {},
    setFocus() {
      this.$nextTick(() => {
        document.getElementById("projectName").focus();
      });
    },
    openModal(action, project) {
      if (project) {
        this.projectForOperations = project;
      } else {
        this.projectForOperations = {};
      }
      this.selectedModal = action;
      this.$refs.newProjectModal.showModal = true;
      const actionName = this.modals[this.selectedModal].action;
      if (typeof this[actionName] === "function") {
        this.currentAction = this[actionName];
      }
    }
  }
};
</script>

<style lang="scss">
.project-operational-modal {
  button {
    margin-top: 25px;
  }
}
</style>
