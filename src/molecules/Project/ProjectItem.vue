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
    margin-right: -20px;
    svg {
      width: 17px;
      height: 17px;
      padding: 12px;
      margin: 0 5px;
      opacity: 0.3;
      &:hover {
        opacity: 0.6;
      }
    }
  }
}
</style>
