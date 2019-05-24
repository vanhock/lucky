<template>
  <div class="center-toolbar">
    <page-selector v-if="state === 'INSPECTOR_STATE_INSPECTING'" />
    <task-creator v-if="state === 'INSPECTOR_STATE_CREATING'" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import PageSelector from "../Inspector/PageSelector";
import TaskCreator from "../Inspector/TaskCreator";

export default {
  name: "CenterToolbar",
  components: { TaskCreator, PageSelector },
  computed: {
    ...mapGetters(["state"])
  }
};
</script>

<style lang="scss">
.center-toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
