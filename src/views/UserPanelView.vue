<template>
  <div class="dashboard-view">
    <side-bar></side-bar>
    <h1>This is the dashboard</h1>
  </div>
</template>

<script>
import SideBar from "../organisms/SideBar";
export default {
  name: "UserPanelView",
  components: { SideBar }
};
</script>

<style scoped></style>
