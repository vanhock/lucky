<template>
  <v-modal
    :class="{ 'popup-wide': !showPageCreation }"
    ref="operationalModal"
    :title="pageModalTitle"
    :description="pageModalDescription"
    @reload="closeExtension"
    unable-closing
  >
    <template v-if="hasPages && !showPageCreation">
      <card-general-list class="pp-pages-list">
        <v-card-clear
          v-for="page in pages"
          :key="page.id"
          :name="page.name"
          :caption="normalizeDate(page.updatedAt)"
          @click="selectPage(page)"
        />
      </card-general-list>
      <div class="pp-pages-selector-action">
        <span>{{ $t("Or you can ") }}</span>
        <v-button-inline @click="toggleCreate = true">{{
          $t("create new page")
        }}</v-button-inline>
      </div>
    </template>
    <template v-if="showPageCreation">
      <form-group ref="operationalForm">
        <v-input-bordered
          name="websiteUrl"
          :label="$t('Website URL')"
          :value="currentWebsiteUrl"
          disabled
        />
        <v-input-bordered
          ref="pageName"
          name="name"
          :label="$t('Page name')"
          :value="currentWebsiteUrl"
        />
        <v-input-bordered
          name="projectName"
          :label="$t('Project name')"
          :value="currentHostname"
        />
      </form-group>
      <v-button-primary @click="createPage">{{
        $t("create")
      }}</v-button-primary>
      <div class="pp-pages-selector-action" v-if="hasPages">
        <span>{{ $t("Or you can ") }}</span>
        <v-button-inline @click="toggleCreate = false">{{
          $t("select from Found pages")
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
    currentWebsiteUrl: location.href
  }),
  computed: {
    ...mapGetters(["pages", "hasPages", "port"]),
    currentHostname() {
      return this.currentWebsiteUrl && extractHostname(this.currentWebsiteUrl);
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
          ...this.$refs.operationalForm.getFormFields()
        })
        .then(page => {
          this.$refs.operationalModal.showModal = false;
          this.$store.dispatch(PAGE_SET_CURRENT_PAGE, page);
          return notification(
            this,
            "success",
            `Page "${page.name}" successfully created!`
          );
        })
        .catch(error => notification(this, "error", error));
    },
    selectPage(page) {
      this.$store.dispatch(PAGE_SET_CURRENT_PAGE, page);
      this.$store.dispatch(PROJECT_SET_CURRENT_PROJECT, {
        projectId: page.projectId
      });
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
    max-width: 700px;
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
