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
import { getFromLocal } from "../atoms/utils";
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
      this.setProjectInfo(url.inputValue);
    }, 300),
    setProjectInfo(url) {
      const projectId = url
        .replace(/(http|https):\/\//, "")
        .replace(/\?.*/, "")
        .replace(/[\-\/.]/gm, "");
      const recentProjects =
        getFromLocal("recentProjects") &&
        JSON.parse(getFromLocal("recentProjects"));
      const isProjectExist =
        recentProjects && recentProjects.hasOwnProperty(projectId);
      const projectInfo = {
        id: projectId,
        name: (isProjectExist && recentProjects[projectId].name) || projectId
      };
      this.$store.dispatch("setProjectInfo", projectInfo);
    }
  }
};
</script>

<style lang="scss" scoped>
.enter-website {
  margin: 60px 0 40px;
}
</style>
