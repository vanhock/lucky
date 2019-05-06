<template>
  <div class="projects-list">
    <card-general-list
      :title="title"
      :sort="sort"
      @filtersChange="$emit('filtersChange', $event)"
    >
      <v-card-general
        v-for="project in projects"
        :key="project.id"
        :name="project.name"
        :caption="normalizeData(project.updatedAt)"
        :text="`Pages: ${project.pagesCount || 0}`"
        @delete="$emit('delete', project)"
        @edit="$emit('edit', project)"
        @click="$router.push(`${project.id}/pages`)"
      />
    </card-general-list>
  </div>
</template>

<script>
import CardGeneralList from "../molecules/CardGeneralList";
import VCardGeneral from "../molecules/VCard/VCardGeneral";
import { normalizeData } from "../utils";
export default {
  name: "ProjectsList",
  components: { VCardGeneral, CardGeneralList },
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    title: String,
    sort: Array
  },
  methods: {
    normalizeData(date) {
      return normalizeData(date);
    }
  }
};
</script>
