<template>
  <div class="pages-list">
    <card-general-list :title="title">
      <v-card-general
        v-for="page in pages"
        :key="page.id"
        :name="page.name"
        :caption="page.updatedAt"
        :text="`Tasks: ${page.tasks || 0}`"
        @delete="$emit('delete', page)"
        @edit="$emit('edit', page)"
      />
    </card-general-list>
  </div>
</template>

<script>
import CardGeneralList from "../molecules/CardGeneralList";
import VCardGeneral from "../molecules/VCard/VCardGeneral";

export default {
  name: "PagesList",
  components: { VCardGeneral, CardGeneralList },
  props: {
    pages: {
      type: Array,
      default: () => []
    },
    title: String
  }
};
</script>
