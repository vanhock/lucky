<template>
  <div class="trash-list" v-if="trashes && trashes.length">
    <div class="title">{{ title }}</div>
    <v-card-table
      v-for="trash in trashes"
      :key="trash.id"
      :name="trash.name"
      :caption="trash.updatedAt"
      :actions="actions"
    />
  </div>
</template>

<script>
import VCardTable from "../molecules/VCardTable";
export default {
  name: "TrashList",
  components: { VCardTable },
  data: () => ({
    actions: [
      {
        name: "restore",
        title: "Restore"
      },
      {
        name: "delete",
        title: "Delete forever"
      }
    ]
  }),
  props: {
    trashes: {
      type: Array,
      default: () => []
    },
    title: String
  }
};
</script>

<style scoped></style>
