<template>
  <div class="pp-inspectors-app">
    <top-panel
      id="app-panel"
      @getFoundNodes="getFoundNodes"
      @reloadView="getFoundNodes"
    />
    <design-inspector ref="designInspector" @designScrollTop="scrollWebsite" />
    <website-inspector
      v-if="hasCurrentProject"
      ref="websiteInspector"
      :url="currentProjectUrl || location.href"
      @getFoundNodes="getFoundNodes"
      @setViewParams="setViewParams"
      @websiteScrollTop="scrollDesign"
    />
    <create-or-select-page ref="projectModal" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  simplifyDom,
  addToLocal,
  getParameterByName,
  extractHostname
} from "../utils";
import TopPanel from "../organisms/TopPanel";
import WebsiteInspector from "../organisms/inspectors/WebsiteInspector";
import DesignInspector from "../organisms/inspectors/DesignInspector";
import {
  USER_CHECK_AUTH,
  USER_LOGOUT,
  PAGE_CREATE_PAGE,
  PAGE_EDIT_PAGE,
  PAGE_GET_PAGE,
  PAGE_GET_PAGES,
  PAGE_SET_CURRENT_PAGE,
  PROJECT_CREATE_PROJECT,
  PROJECT_GET_PROJECTS,
  PROJECT_SET_CURRENT_PROJECT,
  TASK_SET_CURRENT_TASK
} from "../services/store/mutation-types";
import CreateOrSelectPage from "../organisms/SelectProjectModal";
import VueHotkey from "v-hotkey";
import Vue from "vue";
Vue.use(VueHotkey);
Vue.directive("clickoutside", {
  bind(el, binding) {
    el._handler = evt => {
      if (!el.contains(evt.target) && binding.expression) {
        binding.value(evt);
      }
    };
    document.addEventListener("click", el._handler);
  },
  unbind(el) {
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
    console.log("I'm inspectors view");
    this.applyInspectorsStyles();
    this.port.postMessage({ inspectorsLoaded: true });
    this.port.onMessage.addListener(response => {
      switch (Object.keys(response)[0]) {
        case "initInspectors":
          sessionStorage.setItem("pp-u-t-s", response.initInspectors);
          this.initView(response.initInspectors);
          break;
        case "screenShot":
          console.log("ScreenShot received!");
          document.getElementById("app-panel").style.display = "block";
          this.$store.dispatch(TASK_SET_CURRENT_TASK, {
            id: -1,
            screenShot: response.screenShot,
            unsaved: true
          });
          break;
        case "resetAuth":
          this.$store.dispatch(USER_LOGOUT);
          break;
      }
    });
  },
  props: {
    permalink: String,
    pageId: String,
    taskId: String
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
    ...mapGetters([
      "hasCurrentProject",
      "currentProject",
      "currentProjectUrl",
      "port",
      "foundNodes",
      "pages",
      "hasPages",
      "state"
    ])
  },
  methods: {
    initView(token) {
      this.$store
        .dispatch(USER_CHECK_AUTH, token)
        .then(() => {
          console.log("Check auth success");
          const permalink =
            getParameterByName("pxl", location.href) || this.permalink;
          const pageId = getParameterByName("pxl-page", location.href);

          if (permalink) {
            this.$store
              .dispatch(PROJECT_SET_CURRENT_PROJECT, { permalink: permalink })
              .then(project => {
                this.$store.dispatch(PAGE_GET_PAGES, {
                  projectId: project.id
                });
              });
          } else {
            this.$store
              .dispatch(PROJECT_GET_PROJECTS, {
                host: extractHostname(location.href).replace("www.", "")
              })
              .then(projects => {
                if (projects.length === 1) {
                  this.$store.dispatch(
                    PROJECT_SET_CURRENT_PROJECT,
                    projects[0]
                  );
                  return this.$store.dispatch(PAGE_GET_PAGES, {
                    projectId: projects[0].id
                  });
                } else if (projects.length === 0) {
                  return this.$store
                    .dispatch(PROJECT_CREATE_PROJECT, {
                      url: location.href
                    })
                    .then(project => {
                      this.$store.dispatch(
                        PROJECT_SET_CURRENT_PROJECT,
                        project
                      );
                      this.$store.dispatch(PAGE_CREATE_PAGE, {
                        projectId: project.id,
                        url: project.url
                      });
                    });
                } else {
                  this.$refs.projectModal.toggleModal(true);
                }
              })
              .catch(() => {
                this.$refs.projectModal.toggleModal(true);
              });
          }
        })
        .catch(message => {
          console.log("Check auth fail: " + message);
          this.$store.dispatch(USER_LOGOUT).then(() => {
            sessionStorage.removeItem("pp-u-t-s");
            return this.port.postMessage({ resetToken: true });
          });
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
      this.$store.dispatch(PAGE_EDIT_PAGE, viewParams);
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
    applyInspectorsStyles() {
      const css = `body {
        overflow: hidden !important;
      }`;
      const style = document.createElement("style");
      if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      document.head.appendChild(style);
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
.pp-inspectors-app {
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
