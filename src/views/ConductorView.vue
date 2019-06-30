<template>
  <div class="conductor-view">
    <empty-placeholder :title="$t(`We are going to: ${pageUrl}`)" icon="logo">
      <div class="conductor-steps" v-if="!authorized || !hasExtension">
        <div class="step-auth">
          {{
            (authorized && "You are authorized") ||
              "You need to login to this project"
          }}
        </div>
        <div class="step-auth">
          {{
            (hasExtension && "Extension installed") ||
              "Install our extension by link"
          }}
        </div>
      </div>
    </empty-placeholder>
  </div>
</template>

<script>
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import {
  PAGE_GET_PAGE,
  PAGE_GET_PAGES,
  PROJECT_SET_CURRENT_PROJECT
} from "../services/store/mutation-types";
import config from "../config";

export default {
  name: "ConductorView",
  components: { EmptyPlaceholder },
  created() {
    this.checkAccessToProject();
  },
  mounted() {
    this.checkExtensionInstalled();
  },
  data: () => ({
    currentProject: null,
    currentPage: null,
    logoParams: {
      iconSize: "20px"
    },
    authorized: true,
    hasExtension: true
  }),
  computed: {
    pageUrl() {
      return this.currentPage && this.currentPage.websiteUrl;
    }
  },
  props: {
    type: String,
    permalink: String,
    page: String
  },
  methods: {
    async checkAccessToProject() {
      this.$store
        .dispatch(PROJECT_SET_CURRENT_PROJECT, { permalink: this.permalink })
        .then(project => {
          this.currentProject = project;
          if (this.pageId) {
            this.$store
              .dispatch(PAGE_GET_PAGE, {
                projectId: project.id,
                id: this.page
              })
              .then(page => {
                this.currentPage = page;
              })
              .catch(error => {});
          } else {
            this.$store
              .dispatch(PAGE_GET_PAGES, { projectId: project.id })
              .then(pages => {
                this.currentPage = pages[0];
              })
              .catch(error => {
                this.authorized = false;
              });
          }
        })
        .catch(error => {});
    },
    checkExtensionInstalled() {
      this.hasExtension =
        document.querySelector(`[extension-id=${config.extensionId}]`) || false;
    }
  }
};
</script>

<style lang="scss" scoped>
.conductor-view {
  max-width: 900px;
  margin: auto;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
