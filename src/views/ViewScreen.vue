<template>
  <div class="view">
    <top-panel @getFoundNodes="getFoundNodes" />
    <design-inspector />
    <website-inspector ref="websiteInspector" @getFoundNodes="getFoundNodes" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { simplifyDom, addToLocal } from "../atoms/utils";
import { getFoundNodesFromApi } from "../api";
import TopPanel from "../organisms/TopPanel";
import WebsiteInspector from "../organisms/WebsiteInspector";
import DesignInspector from "../organisms/DesignInspector";
export default {
  name: "ViewScreen",
  components: { DesignInspector, WebsiteInspector, TopPanel },
  created() {
    !this.viewerReady && this.$router.push({ name: "home" });
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
    frameNodes: null
  }),
  computed: {
    ...mapGetters([
      "viewerReady",
      "currentFrameWindow",
      "foundNodes",
      "isFoundNodes",
      "designBlocks",
      "websiteInspectorReady"
    ])
  },
  watch: {
    websiteInspectorReady(value) {
      if (value === true) {
        this.getFoundNodes();
      }
    }
  },
  methods: {
    getFoundNodes() {
      /** Clear FoundNodes before get it **/
      self.$store.dispatch("setFoundNodes", {});
      this.gettingFoundNodeData = true;

      const body = document.querySelector("iframe[data-perfect-pixel]")
        .contentWindow.document.body;
      this.frameNodes = [...body.getElementsByTagName("*")];
      const simplifiedNodes = simplifyDom(
        this.frameNodes,
        this.currentFrameWindow
      );

      if (this.isFoundNodes) {
        this.$refs.websiteInspector.processNodes(
          this.frameNodes,
          this.foundNodes
        );
        this.gettingFoundNodeData = false;
      } else {
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
      }
    },
    saveProjectToLocal(currentProject) {
      addToLocal("recentProjects", currentProject.id, currentProject);
    },
    setViewParams() {
      const viewParams = self.defaultViewParams;
      //viewParams.websiteInspectorHeight = self.windowDim.height / 2 - 54;
      self.$store.dispatch("setViewParams", viewParams);
    }
  }
};
</script>
