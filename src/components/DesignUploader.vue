<template>
  <div class="design-uploader">
    <input type="file" ref="file" @change="upload" />
  </div>
</template>

<script>
import axios from "axios";
import config from "../config.js";
export default {
  name: "DesignUploader",
  data: () => ({
    uploadUrl: `${config.serverUrl}/upload-design`,
    designJson: null
  }),
  methods: {
    upload(e) {
      const file = e.target.files[0] || e.originalEvent.dataTransfer.files[0];
      if (!file) {
        return;
      }
      const self = this;
      const options = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      const formData = new FormData();
      formData.append("file", file);
      /** ToDo: Add file type validation **/
      axios.post(this.uploadUrl, formData, options).then(response => {
        this.$store.dispatch("setDesignMarkup", response.data);
      });
    }
  }
};
</script>

<style scoped></style>
