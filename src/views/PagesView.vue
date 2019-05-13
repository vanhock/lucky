<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="pages-view">
    <content-with-sidebar>
      <empty-placeholder v-if="!hasPages && loaded" icon="pages">
        <v-button-primary @click="openModal('create')">{{
          $t("newPage")
        }}</v-button-primary>
      </empty-placeholder>
      <template v-if="hasPages && loaded">
        <v-button-primary @click="openModal('create')">{{
          $t("newPage")
        }}</v-button-primary>
        <pages-list
          :pages="pages"
          :title="$t('activePages')"
          @delete="deletePage($event)"
          @edit="openModal('edit', $event)"
        />
      </template>
      <template v-slot:sidebar>
        <div class="title">{{ $t("collaborators") }}</div>
      </template>
    </content-with-sidebar>
    <v-modal
      ref="operationalModal"
      class="operational-modal"
      :title="currentModalTitle"
    >
      <form-group ref="operationalForm">
        <v-input-bordered
          id="pageName"
          name="name"
          :value="selectedName"
          :label="$t('Page title')"
          required
        />
        <v-input-bordered
          id="pageWebsite"
          name="websiteUrl"
          :value="selectedPageWebsite"
          :label="$t('Website URL')"
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
      "createPage": "Create page",
      "editPage": "Edit Page",
      "newPage": "New Page",
      "activePages": "Active pages",
      "collaborators": "Collaborators",
      "Page title": "Page title",
      "Website URL": "Website URL"
    },
    "ru": {
      "createPage": "Создать страницу",
      "editPage": "Изменить страницу",
      "newPage": "Новая страница",
      "activePages": "Активные страницы",
      "collaborators": "Работают над проектом",
      "Page title": "Заголовок страницы",
      "Website URL": "Адрес сайта"
    }
  }
</i18n>

<script>
import ContentWithSidebar from "../layouts/ContentWithSidebar";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import {
  PAGE_CREATE_PAGE,
  PAGE_EDIT_PAGE,
  PAGE_GET_PAGES,
  PAGE_MOVE_TO_TRASH,
  PROJECT_SET_CURRENT_PROJECT
} from "../services/store/mutation-types";
import { notification } from "../services/notification";
import { mapGetters } from "vuex";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import VModal from "../molecules/VModal";
import FormGroup from "../molecules/FormGroup";
import PagesList from "../organisms/PagesList";
import UserPanelMixin from "../mixins/ModalMixin";
import VInputBordered from "../molecules/VInput/VInputBordered";
export default {
  name: "PagesView",
  mixins: [UserPanelMixin],
  components: {
    VInputBordered,
    PagesList,
    FormGroup,
    VModal,
    EmptyPlaceholder,
    VButtonPrimary,
    ContentWithSidebar
  },
  props: {
    projectId: String
  },
  created() {
    this.initPages(this.$route.params.projectId);
  },
  beforeRouteUpdate(to, from, next) {
    if (from.name === "Pages" && to.name === "Pages") {
      this.initPages(to.params.projectId);
    }
    next();
  },
  beforeDestroy() {
    this.$store.dispatch(PROJECT_SET_CURRENT_PROJECT, {});
  },
  data: () => ({
    loaded: false,
    modals: {},
    selectedModal: "create"
  }),
  computed: {
    ...mapGetters(["hasPages", "pages", "currentProject", "projects"]),
    selectedPageWebsite() {
      return this.dataForOperations && this.dataForOperations.websiteUrl;
    }
  },
  methods: {
    initPages(projectId) {
      this.getProject(projectId);
      this.getPages(projectId);
      this.modals = {
        create: {
          title: this.$t("createPage"),
          action: "createPage",
          buttonName: this.$t("create")
        },
        edit: {
          title: this.$t("editPage"),
          action: "editPage",
          buttonName: this.$t("save")
        }
      };
    },
    getProject(projectId) {
      this.$store.dispatch(PROJECT_SET_CURRENT_PROJECT, {
        projectId: projectId
      });
    },
    getPages(projectId) {
      this.$store
        .dispatch(PAGE_GET_PAGES, { projectId: projectId })
        .then(() => {
          this.loaded = true;
        })
        .catch(error => {
          notification(this, "error", error);
          this.loaded = true;
        });
    },
    createPage() {
      if (!this.$refs.operationalForm.valid) {
        return notification(
          this,
          "error",
          "Page name did not provide or not valid!"
        );
      }
      this.$store
        .dispatch(PAGE_CREATE_PAGE, {
          ...this.$refs.operationalForm.changedItems,
          projectId: this.currentProject.id
        })
        .then(page => {
          this.$refs.operationalModal.showModal = false;
          return notification(
            this,
            "success",
            `Page "${page.name}" successfully created!`
          );
        })
        .catch(error => notification(this, "error", error));
    },
    editPage() {
      if (!this.$refs.operationalForm.childrenChanged) {
        return;
      }
      if (!this.$refs.operationalForm.valid) {
        return notification(
          this,
          "error",
          "Page name did not provide or not valid!"
        );
      }
      this.$store
        .dispatch(PAGE_EDIT_PAGE, {
          ...this.$refs.operationalForm.changedItems,
          id: this.dataForOperations.id,
          projectId: this.currentProject.id
        })
        .then(() => {
          this.$refs.operationalModal.showModal = false;
          return notification(this, "success", "Page successfully edited");
        })
        .then(error => notification(this, "error", error));
    },
    deletePage(page) {
      if (!page) {
        return;
      }
      this.$store
        .dispatch(PAGE_MOVE_TO_TRASH, page)
        .then(() => {
          return notification(this, "success", `"${page.name}" moved to trash`);
        })
        .then(error => notification(this, "error", error));
    }
  }
};
</script>

<style scoped></style>
