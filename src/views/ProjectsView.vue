<template>
  <div class="projects-view">
    <top-bar />
    <template v-if="hasProjects">
      <v-button-primary @click="$refs.newProjectModal.showModal = true"
        >New project</v-button-primary
      >
      <projects-list :projects="projects" />
    </template>
    <template v-if="!hasProjects">
      <empty-placeholder title="Have no projects yet" icon="project">
        <v-button-primary @click="$refs.newProjectModal.showModal = true"
          >New project</v-button-primary
        >
      </empty-placeholder>
    </template>
    <v-modal ref="newProjectModal" class="create-project" @open="setFocus">
      <form-group ref="createProjectForm">
        <v-input-clear
          id="projectName"
          name="name"
          label="Project title"
          required
        />
      </form-group>
      <v-button-primary @click="createProject">Create project</v-button-primary>
    </v-modal>
  </div>
</template>

<script>
import TopBar from "../organisms/TopBar";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import ProjectsList from "../organisms/ProjectsList";
import VModal from "../molecules/VModal";
import FormGroup from "../molecules/FormGroup";
import VInputClear from "../molecules/VInput/VInputClear";
import { mapGetters } from "vuex";
import {
  PROJECT_CREATE_PROJECT,
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
    VButtonPrimary,
    TopBar
  },
  computed: {
    ...mapGetters(["projects", "hasProjects"])
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
    setFocus() {
      this.$nextTick(() => {
        document.getElementById("projectName").focus();
      });
    }
  }
};
</script>

<style lang="scss">
.create-project {
  button {
    margin-top: 25px;
  }
}
</style>
