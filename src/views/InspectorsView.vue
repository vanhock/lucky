<template>
  <div class="view">
    <top-panel @getFoundNodes="getFoundNodes" @reloadView="getFoundNodes" />
    <design-inspector ref="designInspector" @designScrollTop="scrollWebsite" />
    <website-inspector
      ref="websiteInspector"
      @getFoundNodes="getFoundNodes"
      @websiteInspectorReady="initView"
      @setViewParams="setViewParams"
      @websiteScrollTop="scrollDesign"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { simplifyDom, addToLocal, removeClass } from "../atoms/utils";
import { getFoundNodesFromApi } from "../api/api";
import TopPanel from "../organisms/TopPanel";
import WebsiteInspector from "../organisms/WebsiteInspector";
import DesignInspector from "../organisms/DesignInspector";
export default {
  name: "ViewScreen",
  components: { DesignInspector, WebsiteInspector, TopPanel },
  created() {
    !this.viewerReady && this.$router.push({ name: "home" });
  },
  mounted() {
    this.currentFrame && this.initView();
  },
  beforeRouteUpdate(from, to, next) {
    if (!this.viewerReady) {
      next(false);
      this.$router.push({ name: "home" });
    } else {
      next(true);
    }
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
    }
  }),
  computed: {
    ...mapState(["currentProject"]),
    ...mapGetters([
      "viewerReady",
      "currentFrame",
      "currentFrameDocument",
      "currentFrameWindow",
      "foundNodes",
      "isFoundNodes"
    ]),
    designBlocks() {
      return (
        this.currentProject &&
        this.currentProject.hasOwnProperty("designBlocks") &&
        this.currentProject.designBlocks
      );
    }
  },
  methods: {
    initView() {
      this.gettingFoundNodeData = true;

      const body = document.querySelector("iframe[data-perfect-pixel]")
        .contentWindow.document.body;
      this.frameNodes = [...body.getElementsByTagName("*")];
      if (!this.frameNodes.length) {
        return;
      }
      if (this.isFoundNodes) {
        this.$refs.websiteInspector.processNodes(
          this.frameNodes,
          this.foundNodes
        );
        this.gettingFoundNodeData = false;
      } else {
        this.getFoundNodes();
      }
    },
    getFoundNodes() {
      this.clearFrame();
      this.gettingFoundNodeData = true;
      this.$store.dispatch("setFoundNodes", {});
      const body = document.querySelector("iframe[data-perfect-pixel]")
        .contentWindow.document.body;
      this.frameNodes = [...body.getElementsByTagName("*")];
      const simplifiedNodes = simplifyDom(
        this.frameNodes,
        this.currentFrameWindow
      );
      getFoundNodesFromApi(this.designBlocks, simplifiedNodes, foundNodes => {
        if (
          !foundNodes ||
          typeof foundNodes !== "object" ||
          !Object.entries(foundNodes).length
        ) {
          return console.log("nodes not found!");
        }
        this.$refs.websiteInspector.processNodes(this.frameNodes, foundNodes);
        this.$store
          .dispatch("setFoundNodes", foundNodes)
          .then(currentProject => {
            this.saveProjectToLocal(currentProject);
          });
        this.gettingFoundNodeData = false;
      });
    },
    saveProjectToLocal(currentProject) {
      addToLocal("recentProjects", currentProject.id, currentProject);
    },
    setViewParams() {
      const viewParams = this.defaultViewParams;
      this.$store.dispatch("setViewParams", viewParams);
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
    }
  }
};
</script>
