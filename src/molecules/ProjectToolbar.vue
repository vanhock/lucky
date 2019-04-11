<template>
  <div class="project-toolbar">
    <div class="project-selector" v-show="!editing">Default project</div><span class="divider"></span>
    <div class="page-rename" :contenteditable="editing">
      {{ currentProject.name }}
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "ProjectToolbar",
  data: () => ({
    editing: false
  }),
  computed: {
    ...mapState(["currentProject"])
  }
};
</script>

<style lang="scss" scoped>
.project-toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  & > * {
    margin: 0 5px;
  }
  .divider {
    width: 10px;
    height: 1px;
    background-color: $color-b4;
    transform: rotate(-45deg);
    pointer-events: none;
  }
  .project-selector {
    color: $color-b4;
    font-size: 13px;
    cursor: default;
  }
  .page-rename {
    color: $color-b6;
    font-size: 14px;
    margin-top: 2px;
    cursor: pointer;
  }
}
</style>
