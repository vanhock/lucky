<template>
  <div class="user-panel">
    <side-bar :menu="menu"></side-bar>
    <div class="user-panel-content">
      <div class="user-panel-container"><router-view /></div>
    </div>
  </div>
</template>

<script>
import SideBar from "../organisms/SideBar";
export default {
  name: "UserPanelView",
  components: { SideBar },
  data: () => ({
    menu: [
      { text: "Projects", icon: "folder-outline", to: "projects" },
      {
        text: "Account",
        icon: "user-solid-circle",
        to: "account",
        label: "soon",
        disabled: true
      },
      { text: "Log out", icon: "stand-by", to: "logOut" }
    ]
  })
};
</script>

<style lang="scss">
.user-panel {
  height: 100%;
  display: flex;
  box-sizing: border-box;
  &-content {
  }
  &-container {
    padding: 30px;
  }
}
</style>
