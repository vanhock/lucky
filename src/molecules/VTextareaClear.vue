<template>
  <v-textarea
    class="v-textarea-clear"
    ref="textarea"
    :type="type"
    :id="id"
    :name="name"
    :value="value"
    :label="label"
    :placeholder="placeholder"
    :required="required"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :theme="theme"
  />
</template>

<script>
import VTextarea from "../atoms/VTextarea";
export default {
  name: "VTextareaClear",
  components: { VTextarea },
  extends: VTextarea,
  mounted() {
    const self = this;
    this.$refs.textarea.$on("onchange", () => {
      self.$emit("onchange");
    });
  }
};
</script>

<style scoped></style>
