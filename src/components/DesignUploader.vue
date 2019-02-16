<template>
  <div class="design-uploader">
    <label for="file" class="drag-area"
      >Drag the design or click for upload</label
    >
    <input id="file" type="file" ref="file" @change="upload" hidden />
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

<style lang="scss" scoped>
.design-uploader {
  .drag-area {
    background-color: $color-bg2;
    border: 1px dashed $color-w1;
    border-radius: 7px;
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
}
</style>
