<template>
  <div class="user-panel">
    <side-bar :menu="menu"></side-bar>
    <div class="user-panel-content">
      <div class="user-panel-container">
        <breadcrumbs />
        <div class="user-panel-title">{{ $route.meta.title }}</div>
        <router-view class="user-panel-view" />
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from "../organisms/SideBar";
import { mapGetters } from "vuex";
import Breadcrumbs from "../molecules/Breadcrumbs";
import {
  AUTH_CHECK_AUTH,
  PROJECT_GET_PROJECTS
} from "../services/store/mutation-types";
export default {
  name: "UserPanelView",
  components: { Breadcrumbs, SideBar },
  created() {
    this.init();
  },
  data: () => ({
    menu: [],
    showPreloader: false
  }),
  computed: {
    ...mapGetters(["currentProject", "projects", "userName"])
  },
  methods: {
    init() {
      this.getUser().then(() => {
        this.getProjects();
        this.fillMenu();
      });
    },
    getProjects: async function() {
      await this.$store.dispatch(PROJECT_GET_PROJECTS);
    },
    getUser: async function() {
      await this.$store.dispatch(AUTH_CHECK_AUTH);
    },
    fillMenu() {
      this.menu = [
        {
          text: this.$t("projects"),
          icon: "folder-outline",
          to: { name: "Projects" },
          children: "lastProjects"
        },
        {
          text: this.$t("trash"),
          icon: "trash",
          to: { name: "Trash" }
        },
        {
          text: this.$t("account"),
          icon: "user-solid-circle",
          to: { name: "Account" },
          label: this.$t("soon"),
          disabled: true,
          bottom: true
        },
        {
          text: this.$t("logOut"),
          icon: "stand-by",
          to: { name: "LogOut" },
          label: this.userName
        }
      ];
    }
  }
};
</script>

<style lang="scss">
.user-panel {
  height: 100%;
  display: flex;
  box-sizing: border-box;
  background-color: $color-bg4;
  overflow-x: hidden;
  &-content {
    width: 100%;
    height: 100%;
    max-width: 1300px;
    min-width: 700px;
    padding-right: 125px;
    .title {
      font-weight: 500;
    }
  }
  &-container {
    margin: 25px 70px;
    width: 100%;
    box-sizing: border-box;
  }
  &-title {
    font-size: 30px;
    margin-bottom: 35px;
  }
  &-view {
    border-radius: 7px;
  }
}
</style>
