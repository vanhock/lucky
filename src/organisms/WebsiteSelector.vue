<template>
  <div class="website-selector">
    <v-input-search
      ref="search"
      name="url"
      title="URL"
      :placeholder="$t('Type website URL..')"
      @onchange="$emit('onchange')"
      :validation-message="$t('URL not valid')"
      required
    />
  </div>
</template>

<script>
import VInputSearch from "../molecules/VInput/VInputSearch";
export default {
  name: "WebsiteSelector",
  components: { VInputSearch },
  mounted() {
    this.$refs.search.$on("onclick", () => {
      this.$emit("create");
    });
  }
};
</script>

<style lang="scss">
.website-selector {
  @include box-shadow(medium);
  background-color: #fff;
  border-radius: 7px;
}
</style>
