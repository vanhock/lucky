<template>
  <div class="user-panel">
    <side-bar :menu="menu"></side-bar>
    <div class="user-panel-content">
      <div class="user-panel-container">
        <div class="user-panel-title">{{ $route.name }}</div>
        <router-view class="user-panel-view" />
      </div>
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
      { text: "Projects", icon: "folder-outline", to: "Projects" },
      {
        text: "Account",
        icon: "user-solid-circle",
        to: "Account",
        label: "soon",
        disabled: true
      },
      { text: "Trash", icon: "trash", label: "soon", disabled: true },
      { text: "Log out", icon: "stand-by", to: "LogOut" }
    ]
  })
};
</script>

<style lang="scss">
.user-panel {
  height: 100%;
  display: flex;
  box-sizing: border-box;
  background-color: $color-b5;
  &-content {
    width: 100%;
    height: 100%;
    max-width: 1000px;
    .title {
      margin-top: 30px;
      font-weight: 500;
    }
  }
  &-container {
    margin: 20px 70px;
    width: 100%;
    box-sizing: border-box;
  }
  &-title {
    font-size: 27px;
    margin-bottom: 30px;
  }
  &-view {
    border-radius: 7px;
    @include box-shadow(medium);
  }
}
</style>
