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
        :image="project.image"
        :caption="normalizeDate(project.updatedAt)"
        :text="`Pages: ${project.pagesCount || 0}`"
        @delete="$emit('delete', project)"
        @edit="$emit('edit', project)"
        @click="$router.push(`/app/${project.permalink}`)"
      />
    </card-general-list>
  </div>
</template>

<script>
import CardGeneralList from "../molecules/CardGeneralList";
import VCardGeneral from "../molecules/VCard/VCardGeneral";
import { normalizeDate } from "../utils";
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
    normalizeDate(date) {
      return normalizeDate(date);
    }
  }
};
</script>
