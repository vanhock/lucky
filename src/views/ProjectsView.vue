<template>
  <div class="projects-view">
    <router-view v-if="$route.name === 'Pages'"></router-view>
    <template v-else>
      <template v-if="hasProjects && loaded">
        <v-button-primary @click="openModal('create')"
          >New project</v-button-primary
        >
        <project-list
          title="Active projects"
          :projects="projects"
          :sort="sort"
          @delete="deleteProject($event)"
          @edit="openModal('edit', $event)"
          @filtersChange="getAllProjects($event)"
        />
      </template>
      <empty-placeholder
        v-if="!hasProjects && loaded"
        title="Have no projects yet"
        icon="project"
      >
        <v-button-primary @click="openModal('create')"
          >New project</v-button-primary
        >
      </empty-placeholder>
      <v-modal
        ref="operationalModal"
        class="operational-modal"
        :title="currentModalTitle"
      >
        <form-group ref="operationalForm">
          <v-input-clear
            id="projectName"
            name="name"
            :value="selectedName"
            label="Project title"
            required
          />
        </form-group>
        <v-button-primary @click="currentAction">{{
          currentModalButtonName
        }}</v-button-primary>
      </v-modal>
    </template>
  </div>
</template>

<script>
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import ProjectList from "../organisms/ProjectsList";
import VModal from "../molecules/VModal";
import FormGroup from "../molecules/FormGroup";
import VInputClear from "../molecules/VInput/VInputClear";
import { mapGetters } from "vuex";
import {
  PROJECT_CREATE_PROJECT,
  PROJECT_EDIT_PROJECT,
  PROJECT_GET_ALL_PROJECTS,
  PROJECT_MOVE_TO_TRASH
} from "../services/store/mutation-types";
import { notification } from "../services/notification";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import UserPanelMixin from "../mixins/UserPanelMixin";
export default {
  name: "ProjectsView",
  created() {
    this.getAllProjects();
  },
  mixins: [UserPanelMixin],
  components: {
    EmptyPlaceholder,
    VInputClear,
    FormGroup,
    VModal,
    ProjectList,
    VButtonPrimary
  },
  data: () => ({
    loaded: false,
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
    sort: [
      {
        name: "sort",
        label: "Sort",
        options: [
          { name: "by Activity", value: "updatedAt" },
          { name: "by Pages count", value: "pagesCount" },
          { name: "A-Z", value: "name" }
        ]
      }
    ]
  }),
  computed: {
    ...mapGetters(["projects", "hasProjects"])
  },
  methods: {
    getAllProjects(params) {
      this.$store
        .dispatch(PROJECT_GET_ALL_PROJECTS, params || "")
        .then(() => {
          this.loaded = true;
        })
        .catch(error => {
          notification(this, "error", error);
          this.loaded = true;
        });
    },
    createProject() {
      if (!this.$refs.operationalForm.valid) {
        return notification(
          this,
          "error",
          "Project name did not provide or not valid!"
        );
      }
      this.$store
        .dispatch(
          PROJECT_CREATE_PROJECT,
          this.$refs.operationalForm.changedItems
        )
        .then(project => {
          this.$refs.operationalModal.showModal = false;
          return notification(
            this,
            "success",
            `Project "${project.name}" successfully created!`
          );
        })
        .catch(error => notification(this, "error", error));
    },
    editProject() {
      if (!this.$refs.operationalForm.childrenChanged) {
        return;
      }
      if (!this.$refs.operationalForm.valid) {
        return notification(
          this,
          "error",
          "Project name did not provide or not valid!"
        );
      }
      this.$store
        .dispatch(PROJECT_EDIT_PROJECT, {
          ...this.$refs.operationalForm.changedItems,
          id: this.dataForOperations.id
        })
        .then(() => {
          this.$refs.operationalModal.showModal = false;
          return notification(this, "success", "Project successfully edited");
        })
        .then(error => notification(this, "error", error));
    },
    deleteProject(project) {
      if (!project) {
        return;
      }
      this.$store
        .dispatch(PROJECT_MOVE_TO_TRASH, project)
        .then(() => {
          return notification(
            this,
            "success",
            `"${project.name}" moved to trash`
          );
        })
        .then(error => notification(this, "error", error));
    }
  }
};
</script>

<style lang="scss"></style>
