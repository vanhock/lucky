<template>
  <div class="pp-inspectors-app">
    <top-panel @getFoundNodes="getFoundNodes" @reloadView="getFoundNodes" />
    <design-inspector ref="designInspector" @designScrollTop="scrollWebsite" />
    <website-inspector
      ref="websiteInspector"
      @getFoundNodes="getFoundNodes"
      @setViewParams="setViewParams"
      @websiteScrollTop="scrollDesign"
    />
    <v-modal
      ref="operationalModal"
      :show="showPageSelectModal"
      :title="pageModalTitle"
      :description="pageModalDescription"
    >
      <template v-if="hasPages">
        <card-general-list>
          <v-card-general v-for="page in pages" :key="page.id" />
        </card-general-list>
        <div class="pages-selector-action">
          <span>{{ $t("Or you can ") }}</span>
          <v-button-inline>{{ $t("create new page") }}</v-button-inline>
        </div>
      </template>
      <template v-if="(hasPages && showPageModalCreationBlock) || true">
        <form-group>
          <v-input-bordered
            name="websiteUrl"
            :label="$t('Website URL')"
            :value="currentWebsiteUrl"
            disabled
          />
          <v-input-bordered
            name="name"
            :label="$t('Page name')"
            :value="currentWebsiteUrl"
            required
          />
          <v-input-bordered
            name="projectName"
            :label="$t('Project name')"
            :value="currentHostname"
          />
        </form-group>
        <v-button-primary>{{ $t("create") }}</v-button-primary>
      </template>
    </v-modal>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import {
  simplifyDom,
  addToLocal,
  removeClass,
  extractHostname
} from "../utils";
import TopPanel from "../organisms/TopPanel";
import WebsiteInspector from "../organisms/inspectors/WebsiteInspector";
import DesignInspector from "../organisms/inspectors/DesignInspector";
import {
  INSPECTOR_SET_VIEW_PARAMS,
  PAGE_GET_PAGES
} from "../services/store/mutation-types";
import VModal from "../molecules/VModal";
import CardGeneralList from "../molecules/CardGeneralList";
import VCardGeneral from "../molecules/VCard/VCardGeneral";
import FormGroup from "../molecules/FormGroup";
import VInputBordered from "../molecules/VInput/VInputBordered";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import VButtonInline from "../molecules/VButton/VButtonInline";
export default {
  name: "ViewScreen",
  components: {
    VButtonInline,
    VButtonPrimary,
    VInputBordered,
    FormGroup,
    VCardGeneral,
    CardGeneralList,
    VModal,
    DesignInspector,
    WebsiteInspector,
    TopPanel
  },
  created() {
    this.initView();
  },
  data: () => ({
    gettingFoundNodeData: true,
    frameNodes: null,
    defaultViewParams: {
      websiteInspector: true,
      designInspector: true,
      websiteInspectorHeight: window.innerHeight / 2 - 24,
      showAllDesignBlocks: true,
      showFoundDesignBlocks: true
    },
    showPageSelectModal: false,
    showPageModalCreationBlock: false,
    currentWebsiteUrl: location.href
  }),
  computed: {
    ...mapState(["currentProject"]),
    ...mapGetters([
      "viewerReady",
      "currentFrame",
      "currentFrameDocument",
      "currentFrameWindow",
      "foundNodes",
      "isFoundNodes",
      "pages",
      "hasPages"
    ]),
    designBlocks() {
      return (
        this.currentProject &&
        this.currentProject.hasOwnProperty("designBlocks") &&
        this.currentProject.designBlocks
      );
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
    currentHostname() {
      return this.currentWebsiteUrl && extractHostname(this.currentWebsiteUrl);
    }
  },
  methods: {
    initView() {
      this.getPages();
    },
    getPages() {
      this.$store
        .dispatch(PAGE_GET_PAGES, { websiteUrl: location.href })
        .then(() => {
          this.showPageSelectModal = true;
        })
        .catch(() => {
          this.showPageSelectModal = true;
        });
    },
    getFoundNodes() {
      this.clearFrame();
      this.gettingFoundNodeData = true;
      this.$store.dispatch("INSPECTOR_SET_FOUND_NODES", {});
      const body = document.querySelector("iframe[data-perfect-pixel]")
        .contentWindow.document.body;
      this.frameNodes = [...body.getElementsByTagName("*")];
      const simplifiedNodes = simplifyDom(
        this.frameNodes,
        this.currentFrameWindow
      );
      /*getFoundNodesFromApi(this.designBlocks, simplifiedNodes, foundNodes => {
        if (
          !foundNodes ||
          typeof foundNodes !== "object" ||
          !Object.entries(foundNodes).length
        ) {
          return console.log("nodes not found!");
        }
        this.$refs.websiteInspector.processNodes(this.frameNodes, foundNodes);
        this.$store
          .dispatch("INSPECTOR_SET_FOUND_NODES", foundNodes)
          .then(currentProject => {
            this.saveProjectToLocal(currentProject);
          });
        this.gettingFoundNodeData = false;
      });*/
    },
    saveProjectToLocal(currentProject) {
      addToLocal("recentProjects", currentProject.id, currentProject);
    },
    setViewParams() {
      const viewParams = this.defaultViewParams;
      this.$store.dispatch(INSPECTOR_SET_VIEW_PARAMS, viewParams);
    },
    clearFrame() {
      if (!this.currentFrameDocument) {
        return;
      }
      const tips = this.currentFrameDocument.getElementsByClassName(
        "pp-found-node-tip"
      );
      const foundElements = this.currentFrameDocument.getElementsByClassName(
        "pp-element"
      );
      this.$refs.websiteInspector.detachEvents();
      if (tips && tips.length) {
        while (tips.length) {
          tips[tips.length - 1].remove();
        }
      }
      if (foundElements && foundElements.length) {
        while (foundElements.length) {
          removeClass(foundElements[foundElements.length - 1], "pp-element");
        }
      }
    },
    scrollWebsite(value) {
      if (!this.currentFrameDocument) {
        return;
      }
      this.currentFrameDocument.scrollingElement.scrollTop = value;
    },
    scrollDesign(value) {
      if (!this.$refs.designInspector) {
        return;
      }
      this.$refs.designInspector.scrollDocument(value);
    },
    setModalsContent() {
      this.modals = {
        newPage: {
          title: this.$t("Create new page"),
          action: "createProject",
          buttonName: this.$t("create")
        },
        foundPages: {
          title: this.$t("Select page"),
          description: this.$t("We found pages, associated with this URL:"),
          action: "changeModal"
        }
      };
    }
  }
};
</script>
<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700&subset=cyrillic");
@import url("https://fonts.googleapis.com/css?family=Roboto:400,700,900&subset=cyrillic");
@import "../assets/styles/normalize";
@import "../assets/styles/animation";
@import "../assets/styles/notification";
html,
body {
  height: 100%;
}
body {
  background-color: $color-base;
  box-sizing: border-box;
}
.pp-inspectors-app {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: $color-bg1;
  z-index: 99999;
  font-family: "Montserrat", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $color-b2;

  .website-logo {
    position: absolute;
    width: 70px;
    height: 60px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
    }
  }

  .clearfix:after {
    content: "";
    display: block;
    clear: both;
  }
  .hidden {
    position: fixed;
    z-index: -1;
    width: 0;
    height: 0;
    visibility: hidden;
  }
  [disabled] {
    pointer-events: none;
  }

  button,
  input,
  [contenteditable] {
    font-family: "Roboto", sans-serif;
    border: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: transparent;
    &:focus,
    &:active,
    &:visited {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      border: 0;
      outline: 0;
    }
  }
}
.pages-selector-action {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
