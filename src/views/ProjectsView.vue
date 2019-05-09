<template>
  <div class="projects-view">
    <router-view v-if="$route.name === 'Pages'"></router-view>
    <template v-else>
      <template v-if="hasProjects && loaded">
        <v-button-primary @click="openModal('create')">{{
          $t("newProject")
        }}</v-button-primary>
        <project-list
          :title="$t('activeProjects')"
          :projects="projects"
          :sort="sort"
          @delete="deleteProject($event)"
          @edit="openModal('edit', $event)"
          @filtersChange="getAllProjects($event)"
        />
      </template>
      <empty-placeholder
        v-if="!hasProjects && loaded"
        :title="$t('Have no projects yet')"
        icon="project"
      >
        <v-button-primary @click="openModal('create')">{{
          $t("newProject")
        }}</v-button-primary>
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
            :label="$t('projectTitle')"
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
<i18n>
  {
    "en": {
      "newProject": "New project",
      "activeProjects": "Active projects",
      "projectTitle": "Project title",
      "Have no projects yet": "Have no projects yet"
    },
    "ru": {
      "newProject": "Новый проект",
      "activeProjects": "Активные проекты",
      "projectTitle": "Название проекта",
      "Have no projects yet": "Пока нет проектов"
    }
  }
</i18n>
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
import UserPanelMixin from "../mixins/ModalMixin";
export default {
  name: "ProjectsView",
  created() {
    this.getAllProjects();
    this.sort = [
      {
        name: "sort",
        label: this.$t("sort"),
        options: [
          { name: this.$t("byActivity"), value: "updatedAt" },
          { name: this.$t("byPagesCount"), value: "pagesCount" },
          { name: this.$t("A-Z"), value: "name" }
        ]
      }
    ];
    this.modals = {
      create: {
        title: this.$t("createProject"),
        action: "createProject",
        buttonName: this.$t("create")
      },
      edit: {
        title: this.$t("editProject"),
        action: "editProject",
        buttonName: this.$t("save")
      }
    };
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
    modals: {},
    selectedModal: "create",
    sort: []
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
