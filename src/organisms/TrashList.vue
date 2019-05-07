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

<i18n>
  {
    "en": {
      "Restore": "Restore",
      "Delete forever": "Delete forever"
    },
    "ru": {
      "Restore": "Восстановить",
      "Delete forever": "Удалить навсегда"
    }
  }
</i18n>

<script>
import { normalizeData } from "../utils";
import VCardTable from "../molecules/VCard/VCardTable";
import CardTableList from "../molecules/CardTableList";
export default {
  name: "TrashList",
  components: { CardTableList, VCardTable },
  created() {
    this.actions = [
      {
        name: "restore",
        title: this.$t("Restore")
      },
      {
        name: "delete",
        title: this.$t("Delete forever")
      }
    ];
  },
  data: () => ({
    actions: []
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
