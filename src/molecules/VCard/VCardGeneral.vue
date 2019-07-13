<template>
  <div class="project-item">
    <v-card
      :name="name"
      :image="image"
      :caption="caption"
      :badge="badge"
      :text="text"
      @click="$emit('click')"
    >
      <div @click="$emit('delete', item)">
        <zondicon icon="trash" />
      </div>
      <div @click="$emit('edit', item)">
        <zondicon icon="edit-pencil" />
      </div>
    </v-card>
  </div>
</template>

<script>
import VCard from "../../atoms/VCard";
import Zondicon from "vue-zondicons/src/components/Zondicon";
export default {
  name: "VCardGeneral",
  components: { Zondicon, VCard },
  extends: VCard,
  props: {
    item: Object
  }
};
</script>

<style lang="scss">
.project-item {
  .v-card-text-container {
    .name {
      height: 30px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 250px;
    }
  }
  .v-card-actions {
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
