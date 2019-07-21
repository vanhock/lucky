<template>
  <v-modal
    class="pp-select-project popup-wide"
    ref="operationalModal"
    :title="$t('Select Project or create new')"
    :description="projectModalDescription"
    @reload="closeExtension"
    unable-closing
  >
    <template v-if="projects && projects.length > 1">
      <card-general-list class="pp-projects-list" :title="$t('Projects')">
        <v-card-clear
          v-for="(project, index) in projects"
          :key="project.id"
          :name="project.name"
          :text="`${$t('Pages')}: 0`"
          :image="imgUrl(project.image)"
          :badge="index === 0 ? $t('Recently used') : null"
          :caption="project.updatedAt | normalizeDate"
          @click="selectProject(project)"
        />
      </card-general-list>
      <div class="pp-projects-selector-action">
        <span>{{ $t("Or you can ") }}</span>
        <v-button-inline @click="createProject">{{
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
import config from "../config";
import {
  PAGE_CREATE_PAGE,
  PAGE_GET_PAGES,
  PROJECT_CREATE_PROJECT,
  PROJECT_SET_CURRENT_PROJECT
} from "../services/store/mutation-types";

export default {
  name: "CreateOrSelectPage",
  components: {
    VCardClear,
    VModal,
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
    projectModalDescription() {
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
    createProject() {
      return this.$store
        .dispatch(PROJECT_CREATE_PROJECT, {
          url: location.href
        })
        .then(project => {
          this.$store.dispatch(PROJECT_SET_CURRENT_PROJECT, project);
          this.$store.dispatch(PAGE_CREATE_PAGE, {
            projectId: project.id,
            url: project.url
          });
          this.$refs.operationalModal.showModal = false;
        });
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
    closeExtension() {
      this.port.postMessage({ closeExtension: true });
    },
    imgUrl(url = "") {
      return `${config.apiUrl}/${url}`;
    }
  }
};
</script>

<style lang="scss">
.pp-modal.popup-wide {
  .pp-modal-container {
    max-width: 844px;
    width: 90%;
    max-height: 90%;
  }
  .pp-modal-content {
    padding: 0;
  }
}

.pp-projects-list {
  padding: 0 30px 90px;
  .card-general-list-container {
    grid-template-columns: 1fr 1fr;
  }
}
.pp-projects-selector-action {
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  text-align: center;
  align-items: center;
  position: sticky;
  background-color: #fff;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30px 0;
}
</style>
