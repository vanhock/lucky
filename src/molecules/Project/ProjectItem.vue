<template>
  <div class="project-item">
    <v-card :name="name" :image="image" :caption="caption" :text="text">
      <div @click="$emit('delete', project)">
        <zondicon icon="trash" />
      </div>
      <div @click="$emit('edit', project)">
        <zondicon icon="edit-pencil" />
      </div>
    </v-card>
  </div>
</template>

<script>
import VCard from "../../atoms/VCard";
import Zondicon from "vue-zondicons/src/components/Zondicon";
export default {
  name: "ProjectItem",
  components: { Zondicon, VCard },
  extends: VCard,
  props: {
    project: Object
  }
};
</script>

<style lang="scss">
.project-item {
  .actions {
    svg {
      width: 15px;
      height: 15px;
      padding: 12px;
      margin: 0 2px;
      opacity: 0.2;
      &:hover {
        opacity: 0.6;
      }
    }
  }
}
</style>
