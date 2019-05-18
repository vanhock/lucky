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
    <website-inspector />
    <create-or-select-page ref="pageModal" />
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { simplifyDom, addToLocal, removeClass } from "../utils";
import TopPanel from "../organisms/TopPanel";
import WebsiteInspector from "../organisms/inspectors/WebsiteInspector";
import DesignInspector from "../organisms/inspectors/DesignInspector";
import {
  AUTH_CHECK_AUTH,
  INSPECTOR_SET_VIEW_PARAMS,
  PAGE_GET_PAGES,
  PAGE_SET_CURRENT_PAGE,
  PROJECT_SET_CURRENT_PROJECT
} from "../services/store/mutation-types";
import CreateOrSelectPage from "../organisms/CreateOrSelectPage";
import Vue from "vue";
Vue.directive("clickoutside", {
  bind(el, binding) {
    el._handler = evt => {
      if (!el.contains(evt.target) && binding.expression) {
        binding.value(evt);
      }
    };
    document.addEventListener("click", el._handler);
  },
  unbind(el, binding) {
    document.removeEventListener("click", el._handler);
  }
});

export default {
  name: "ViewScreen",
  components: {
    CreateOrSelectPage,
    DesignInspector,
    WebsiteInspector,
    TopPanel
  },
  created() {
    this.$nextTick(() => {
      this.port.postMessage({ inspectorsLoaded: true });
      this.port.onMessage.addListener(response => {
        switch (Object.keys(response)[0]) {
          case "initInspectors":
            console.log("init inspector handler");
            sessionStorage.setItem("pp-u-t-s", response.initInspectors);
            this.initView(response.initInspectors);
            break;
          case "reloadPage":
            break;
        }
      });
    });
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
    ...mapGetters(["port", "foundNodes", "pages", "hasPages"])
  },
  methods: {
    initView(token = null) {
      console.log("Check auth request");
      this.$store
        .dispatch(AUTH_CHECK_AUTH, token)
        .then(() => {
          console.log("Check auth success");
          return this.getPages();
        })
        .catch(message => {
          console.log("Check auth fail: " + message);
          sessionStorage.removeItem("pp-u-t-s");
          return this.port.postMessage({ resetToken: true });
        });
    },
    getPages() {
      this.$store
        .dispatch(PAGE_GET_PAGES, { websiteUrl: location.href })
        .then(pages => {
          if (pages.length > 1) {
            this.$refs.pageModal.toggleModal(true);
          } else if (pages.length === 0) {
            this.$refs.pageModal.toggleModal(true);
          } else {
            this.$store.dispatch(PAGE_SET_CURRENT_PAGE, pages[0]);
            this.$store.dispatch(PROJECT_SET_CURRENT_PROJECT, {
              projectId: pages[0].projectId
            });
          }
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
    }
  }
};
</script>
<style lang="scss">
.pp-inspectors-app {
  @import url("https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700&subset=cyrillic");
  @import url("https://fonts.googleapis.com/css?family=Roboto:400,700,900&subset=cyrillic");
  @import "../assets/styles/normalize";
  @import "../assets/styles/animation";
  @import "../assets/styles/notification";
  box-sizing: border-box;
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
