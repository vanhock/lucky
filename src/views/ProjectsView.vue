<template>
  <div class="projects-view">
    <div class="projects-view-add">
      <website-selector ref="websiteSelector" @create="createProject" />
    </div>
    <template v-if="hasProjects && loaded">
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
      transparent
    >
    </empty-placeholder>
    <v-modal
      ref="operationalModal"
      class="operational-modal"
      :title="currentModalTitle"
      wide
    >
      <form-group ref="operationalForm">
        <v-input-clear
          id="projectName"
          name="name"
          :value="selectedName"
          :label="$t('Project name')"
          required
        />
      </form-group>
      <v-button-primary @click="currentAction">{{
        currentModalButtonName
      }}</v-button-primary>
    </v-modal>
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
  PROJECT_GET_PROJECTS,
  PROJECT_MOVE_TO_TRASH,
  PROJECT_SET_SCREENSHOT
} from "../services/store/mutation-types";
import { notification } from "../services/notification";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import ModalMixin from "../mixins/ModalMixin.js";
import WebsiteSelector from "../organisms/WebsiteSelector";

export default {
  name: "ProjectsView",
  created() {
    this.initProjects();
  },
  mixins: [ModalMixin],
  components: {
    WebsiteSelector,
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
    initProjects() {
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
    getAllProjects(params) {
      this.$store
        .dispatch(PROJECT_GET_PROJECTS, params || "")
        .then(() => {
          this.loaded = true;
        })
        .catch(error => {
          notification(this, "error", error);
          this.loaded = true;
        });
    },
    createProject() {
      const url = this.$refs.websiteSelector.$children[0];
      if (!url.isValid) {
        return notification(
          this,
          "error",
          "Project name did not provide or not valid!"
        );
      }
      this.$store
        .dispatch(PROJECT_CREATE_PROJECT, {
          url: url.currentValue
        })
        .then(project => {
          this.$refs.operationalModal.showModal = false;
          notification(
            this,
            "success",
            `Project "${project.name}" successfully created!`
          );
          this.$refs.websiteSelector.$children[0].clearValue();
          this.$store
            .dispatch(PROJECT_SET_SCREENSHOT, {
              permalink: project.permalink,
              url: project.url
            })
            .then(() => {});
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
    },
    updateProject(project) {
      downloadProjectResources(
        { folder: project.permalink, url: project.url },
        () => {}
      );
    }
  }
};
</script>

<style lang="scss">
.projects-view-add {
  display: grid;
  grid-template-columns: 1auto 1auto;
  grid-template-areas: ". .";
}
</style>
