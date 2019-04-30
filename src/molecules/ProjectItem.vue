<template>
  <div class="project-item">
    <v-card :name="name" :image="image" :caption="caption" :text="text">
      <v-toggle icon="trash" text="To trash" @click="$emit('remove')" />
      <v-toggle icon="edit-pencil" text="Rename" @click="$emit('rename')" />
    </v-card>
  </div>
</template>

<script>
import VCard from "../atoms/VCard";
import VToggle from "../atoms/VToggle";
export default {
  name: "ProjectItem",
  components: { VToggle, VCard },
  extends: VCard
};
</script>

<style lang="scss">
.project-item {
}
</style>
