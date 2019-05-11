<template>
  <v-modal
    ref="operationalModal"
    :title="pageModalTitle"
    :description="pageModalDescription"
    unable-closing
  >
    <template v-if="hasPages">
      <card-general-list>
        <v-card-general
          v-for="page in pages"
          :key="page.id"
          :name="page.name"
        />
      </card-general-list>
      <div class="pages-selector-action">
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
    </template>
  </v-modal>
</template>

<script>
import { mapGetters } from "vuex";
import VModal from "../molecules/VModal";
import VCardGeneral from "../molecules/VCard/VCardGeneral";
import CardGeneralList from "../molecules/CardGeneralList";
import VButtonInline from "../molecules/VButton/VButtonInline";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import VInputBordered from "../molecules/VInput/VInputBordered";
import FormGroup from "../molecules/FormGroup";
import { notification } from "../services/notification";
import {
  PAGE_CREATE_PAGE,
  PAGE_SET_CURRENT_PAGE
} from "../services/store/mutation-types";
import { extractHostname } from "../utils";

export default {
  name: "CreateOrSelectPage",
  components: {
    VModal,
    FormGroup,
    VInputBordered,
    VButtonPrimary,
    VButtonInline,
    CardGeneralList,
    VCardGeneral
  },
  data: () => ({
    toggleCreate: false,
    currentWebsiteUrl: location.href
  }),
  computed: {
    ...mapGetters(["pages", "hasPages"]),
    currentHostname() {
      return this.currentWebsiteUrl && extractHostname(this.currentWebsiteUrl);
    },
    pageModalTitle() {
      return (
        (this.hasPages && this.$t("Select page")) || this.$t("Create new page")
      );
    },
    pageModalDescription() {
      return (
        (this.hasPages &&
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
          ...this.$refs.operationalForm.changedItems
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
    selectPage(page) {
      this.$store.dispatch(PAGE_SET_CURRENT_PAGE, page);
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
    }
  }
};
</script>

<style scoped></style>
