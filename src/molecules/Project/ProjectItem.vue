<template>
  <div class="project-item">
    <v-card :name="name" :image="image" :caption="caption" :text="text">
      <zondicon icon="trash" @click="$emit('remove')" />
      <zondicon icon="edit-pencil" @click="$emit('rename')" />
    </v-card>
  </div>
</template>

<script>
import VCard from "../../atoms/VCard";
import VToggle from "../../atoms/VToggle";
import Zondicon from "vue-zondicons/src/components/Zondicon";
export default {
  name: "ProjectItem",
  components: { Zondicon, VToggle, VCard },
  extends: VCard
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
