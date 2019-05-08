<template>
  <h1>
    {{ defaultText }}
    <button class="open-gate" @click="toggleInspector">Start inspector</button>
  </h1>
</template>

<script>
export default {
  data: () => ({
    scriptsLoaded: false
  }),
  mounted() {
    browser.runtime.sendMessage({});
  },
  computed: {
    defaultText() {
      return browser.i18n.getMessage("extName");
    }
  },
  methods: {
    toggleInspector() {
      (!this.scriptsLoaded &&
        browser.runtime.sendMessage("runContentScript")) ||
        browser.runtime.sendMessage("removeContentScript");
      this.scriptsLoaded = !this.scriptsLoaded;
    }
  }
};
</script>
