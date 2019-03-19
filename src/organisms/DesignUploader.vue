<template>
  <div
    class="design-uploader"
    :class="{ uploaded: designImage }"
    v-show="!file"
    @dragover.prevent="onDragOver"
    @drop.prevent="upload"
  >
    <div class="preview" v-if="designImage">
      <div
        class="image"
        v-if="designImage"
        :style="{ backgroundImage: `url(${designImage})` }"
      ></div>
      <div class="params">
        <div class="name">{{ designParams.fileName }}</div>
        <div class="dimensions">
          {{ designParams.width }}x{{ designParams.height }}
        </div>
        <div class="action" @click="$store.dispatch('resetDesign')">
          Удалить
        </div>
      </div>
    </div>
    <label for="file" class="drag-area"
      >Drag the design or click for upload</label
    >
    <input id="file" type="file" ref="file" @input="upload" hidden />
    <preloader :show="uploading" :dark="true" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Preloader from "../atoms/Preloader";
export default {
  name: "DesignUploader",
  components: { Preloader },
  data: () => ({
    file: null,
    uploading: false
  }),
  computed: {
    ...mapGetters(["designImage", "designParams"])
  },
  methods: {
    onDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    upload(e) {
      e.preventDefault();
      e.stopPropagation();
      const self = this;
      const file =
        (e.target.files && e.target.files[0]) ||
        (e.dataTransfer && e.dataTransfer.files[0]);
      if (!file || !window.PSD) {
        return;
      }
      this.uploading = true;
      window.PSD.fromEvent(e).then(psd => {
        const design = psd.tree().export();
        const image = psd.image.toPng();
        const params = {
          fileName: file.name,
          fileSize: file.size,
          width: design.document.width,
          height: design.document.height
        };
        if (!design || !image) {
          return;
        }
        self.$store.dispatch("setDesign", {
          blocks: design,
          image: image.src,
          params: params
        });
        self.$store.dispatch("setFrameParams", {
          width: design.document.width,
          height: design.document.height
        });
        this.uploading = false;
        this.$refs.file.value = "";
      });
      /** ToDo: Add file type validation **/
    }
  }
};
</script>

<style lang="scss" scoped>
.design-uploader {
  position: relative;
  background-color: $color-bg2;
  border: 1px dashed $color-w1;
  color: $color-b6;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  padding: 0 20px;
  margin: 30px 0;
  .drag-area {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      opacity: 0.8;
    }
  }
  &.uploaded {
    border-color: $color-green;
    .drag-area {
      font-size: 14px;
    }
  }
  .preview {
    display: flex;
    color: #fff;
    .image {
      width: 60px;
      height: 60px;
      background-size: cover;
      background-repeat: no-repeat;
      border-radius: 5px;
    }
    .params {
      margin-left: 20px;
      font-size: 12px;
      & > * {
        margin-bottom: 5px;
      }
      .action {
        display: inline-block;
        margin-top: 5px;
        cursor: pointer;
        border-bottom: 1px dashed;
        font-size: 12px;
      }
    }
  }
}
</style>
