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
import FormInput from "../atoms/VInput";
export default {
  name: "EnterWebsite",
  components: { FormInput },
  computed: {
    ...mapGetters(["websiteUrl", "siteUrlProxy"])
  },
  methods: {
    checkUrlAvailable() {
      const url = this.$refs.url;
      this.$nextTick(() => {
        if (!url.valid && url.inputValue !== "") {
          return;
        }

        this.$store.dispatch("setSiteUrl", url.inputValue);
        this.setProjectInfo(url.inputValue);
      });
    },
    setProjectInfo(url) {
      const projectId = url
        .replace(/(http|https):\/\//, "")
        .replace(/\?.*/, "")
        .replace(/[\-\/.]/gm, "");
      const recentProjects = getFromLocal("recentProjects");
      const isProjectExist =
        recentProjects && recentProjects.hasOwnProperty(projectId);
      const projectInfo = {
        id: projectId,
        name: (isProjectExist && recentProjects[projectId].name) || url.replace(/(http|https):\/\//, "").replace(/\?.*/, "")
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
