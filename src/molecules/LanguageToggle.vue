<template>
  <div class="language-toggle">
    <div
      class="toggle"
      :class="{ active: $i18n.locale === locale }"
      v-for="(locale, index) in locales"
      :key="index"
      @click="setLocale(locale)"
    >
      {{ locale }}
    </div>
  </div>
</template>

<script>
export default {
  name: "LanguageToggle",
  created() {
    this.getLocale();
  },
  data: () => ({
    locales: ["en", "ru"]
  }),
  methods: {
    setLocale(locale) {
      localStorage.setItem("locale", locale);
      location.reload();
    },
    getLocale() {
      const locale = localStorage.getItem("locale");
      if (locale) {
        this.$i18n.locale = locale;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.language-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 15px;
  right: 30px;
  background-color: #fff;
  @include box-shadow(medium);
  z-index: 10;
  border-radius: 7px;
  .toggle {
    font-weight: 600;
    text-align: center;
    padding: 10px 15px;
    color: $color-b4;
    &.active {
      color: $color-b2;
    }
    &:not(.active) {
      cursor: pointer;
      &:hover {
        color: $color-b3;
      }
    }
  }
}
</style>
