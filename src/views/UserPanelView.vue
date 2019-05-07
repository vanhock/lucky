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
export default {
  name: "UserPanelView",
  components: { Breadcrumbs, SideBar },
  created() {
    this.menu = [
      { text: this.$t("projects"), icon: "folder-outline", to: "Projects" },
      {
        text: this.$t("account"),
        icon: "user-solid-circle",
        to: "Account",
        label: this.$t("soon"),
        disabled: true
      },
      { text: this.$t("trash"), icon: "trash", to: "Trash" },
      { text: this.$t("logOut"), icon: "stand-by", to: "LogOut" }
    ];
  },
  data: () => ({
    menu: [],
    showPreloader: false
  }),
  computed: {
    ...mapGetters(["currentProject"])
  }
};
</script>

<style lang="scss">
.user-panel {
  height: 100%;
  display: flex;
  box-sizing: border-box;
  background-color: $color-b5;
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
