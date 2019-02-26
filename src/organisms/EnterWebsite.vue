<template>
  <div class="enter-website">
    <form-input
      name="url"
      ref="url"
      label="Enter website:"
      placeholder="Type website url, like google.com"
      @onchange="checkUrlAvailable"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import _ from "lodash";
import FormInput from "../atoms/FormInput";
export default {
  name: "EnterWebsite",
  components: { FormInput },
  computed: {
    ...mapGetters(["siteUrl", "siteUrlProxy"])
  },
  methods: {
    checkUrlAvailable: _.throttle(function() {
      const url = this.$refs.url;
      if (!url.valid && url.inputValue !== "") {
        return;
      }

      this.$store.dispatch("setSiteUrl", url.inputValue);
    }, 300)
  }
};
</script>

<style lang="scss" scoped>
.enter-website {
  margin: 60px 0 40px;
}
</style>
