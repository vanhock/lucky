<template>
  <div
    class="design-uploader"
    v-show="!file"
    @dragover.prevent="onDragOver"
    @drop.prevent="upload"
  >
    <label for="file" class="drag-area"
      >Drag the design or click for upload</label
    >
    <input id="file" type="file" ref="file" @change="upload" hidden />
  </div>
</template>

<script>
export default {
  name: "DesignUploader",
  data: () => ({
    file: null
  }),
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
      window.PSD.fromEvent(e).then(psd => {
        const design = psd.tree().export();
        const image = psd.image.toPng();
        if (!design || !image) {
          return;
        }
        self.$store.dispatch("setDesign", { blocks: design, image: image });
        self.$store.dispatch("setFrameParams", {
          width: design.document.width,
          height: design.document.height
        });
      });
      /** ToDo: Add file type validation **/
    }
  }
};
</script>

<style lang="scss" scoped>
.design-uploader {
  .drag-area {
    background-color: $color-bg2;
    border: 1px dashed $color-w1;
    color: $color-b6;
    border-radius: 7px;
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
