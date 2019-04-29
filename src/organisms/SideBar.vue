<template>
  <div class="sidebar">
    <div class="sidebar-container">
      <slot name="top"></slot>
      <dynamic-menu :items="menu" align="vertical" />
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script>
import DynamicMenu from "../molecules/DynamicMenu";
export default {
  name: "SideBar",
  components: { DynamicMenu },
  data: () => ({
    menu: [{ text: "Projects", icon: "", to: "" }]
  })
};
</script>

<style scoped></style>
