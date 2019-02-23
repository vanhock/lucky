<template>
  <div class="test-view">
    <div v-html="targetViewHtml || 'This is test view'"></div>
  </div>
</template>

<script>
import { getTargetView } from "../api";
export default {
  name: "TestView",
  data: () => ({
    targetViewHtml: null
  }),
  mounted() {
    this.getView("https://luxezone.ru");
  },
  methods: {
    getView(targetUrl) {
      getTargetView(targetUrl, html => {
        this.targetViewHtml = html;
      });
    }
  }
};
</script>

<style scoped></style>
