<template>
  <div class="trash-list" v-if="trash && trash.length">
    <card-table-list :title="title">
      <v-card-table
        class="trash-list-item"
        v-for="item in trash"
        :key="item.id"
        :name="item.name"
        :caption="normalizeData(item.updatedAt)"
        :actions="actions"
        @restore="$emit('restore', item)"
        @delete="$emit('delete', item)"
      />
    </card-table-list>
  </div>
</template>

<script>
import { normalizeData } from "../utils";
import VCardTable from "../molecules/VCard/VCardTable";
import CardTableList from "../molecules/CardTableList";
export default {
  name: "TrashList",
  components: { CardTableList, VCardTable },
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
    trash: {
      type: Array,
      default: () => []
    },
    title: String
  },
  methods: {
    normalizeData(date) {
      return normalizeData(date);
    }
  }
};
</script>
