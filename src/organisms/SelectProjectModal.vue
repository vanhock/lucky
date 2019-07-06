<template>
  <v-modal
    :class="{ 'popup-wide': !showPageCreation }"
    ref="operationalModal"
    :title="pageModalTitle"
    :description="pageModalDescription"
    @reload="closeExtension"
    unable-closing
  >
    <template v-if="sameProjects">
      <card-general-list class="pp-pages-list">
        <v-card-clear
          v-for="project in sameProjects"
          :key="project.id"
          :name="project.name"
          :caption="normalizeDate(project.updatedAt)"
          @click="selectProject(project)"
        />
      </card-general-list>
      <div class="pp-pages-selector-action">
        <span>{{ $t("Or you can ") }}</span>
        <v-button-inline @click="toggleCreate = true">{{
          $t("create new page")
        }}</v-button-inline>
      </div>
    </template>
  </v-modal>
</template>

<script>
import { mapGetters } from "vuex";
import VModal from "../molecules/VModal";
import VCardClear from "../molecules/VCard/VCardClear";
import CardGeneralList from "../molecules/CardGeneralList";
import VButtonInline from "../molecules/VButton/VButtonInline";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import VInputBordered from "../molecules/VInput/VInputBordered";
import FormGroup from "../molecules/FormGroup";
import { notification } from "../services/notification";
import {
  PAGE_CREATE_PAGE,
  PAGE_GET_PAGES,
  PAGE_SET_CURRENT_PAGE,
  PROJECT_SET_CURRENT_PROJECT
} from "../services/store/mutation-types";
import { extractHostname, normalizeDate } from "../utils";

export default {
  name: "CreateOrSelectPage",
  components: {
    VCardClear,
    VModal,
    FormGroup,
    VInputBordered,
    VButtonPrimary,
    VButtonInline,
    CardGeneralList
  },
  mounted() {
    console.log("I'm a 'Create or select' component");
  },
  data: () => ({
    toggleCreate: false,
    currentUrl: location.href,
    currentWebsiteTitle: document.title
  }),
  computed: {
    ...mapGetters(["projects", "hasProjects", "port"]),
    currentHostname() {
      return this.currentUrl && extractHostname(this.currentUrl);
    },
    sameProjects() {
      return (
        this.projects &&
        this.projects.filter(project =>
          project.url.includes(this.currentHostname)
        )
      );
    },
    pageModalTitle() {
      return (
        (!this.showPageCreation && this.$t("Select page")) ||
        this.$t("Create new page")
      );
    },
    pageModalDescription() {
      return (
        (!this.showPageCreation &&
          this.$t("We found pages, associated with this URL:")) ||
        null
      );
    },
    showPageCreation() {
      return this.hasPages ? this.toggleCreate : true;
    }
  },
  methods: {
    createPage() {
      this.$store
        .dispatch(PAGE_CREATE_PAGE, {
          ...this.$refs.operationalForm.getFormChangedFields()
        })
        .then(page => {
          this.$refs.operationalModal.showModal = false;
          this.$store.dispatch(PAGE_SET_CURRENT_PAGE, page);
          this.$store.dispatch(PROJECT_SET_CURRENT_PROJECT, {
            projectId: page.projectId
          });
          return notification(
            this,
            "success",
            `Page "${page.name}" successfully created!`
          );
        })
        .catch(error => notification(this, "error", error));
    },
    selectProject(project) {
      this.$store.dispatch(PROJECT_SET_CURRENT_PROJECT, project);
      this.$store.dispatch(PAGE_GET_PAGES, { projectId: project.id });
      this.$refs.operationalModal.showModal = false;
    },
    toggleModal(open = false) {
      this.$refs.operationalModal.showModal = open;
      this.$nextTick(() => {
        const nameField = document.getElementById("input-name");
        if (!nameField) {
          return;
        }
        setTimeout(() => {
          nameField.focus();
          nameField.select();
        }, 400);
      });
    },
    normalizeDate(date) {
      return normalizeDate(date);
    },
    closeExtension() {
      this.port.postMessage({ closeExtension: true });
    }
  }
};
</script>

<style lang="scss">
.pp-modal.popup-wide {
  .pp-modal-container {
    max-width: 844px;
    width: 90%;
  }
}

.pp-pages-list {
  background-color: $color-b5;
  padding: 0 20px 20px;
  border-radius: 5px;
}
.pp-pages-selector-action {
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  text-align: center;
  align-items: center;
}
</style>
