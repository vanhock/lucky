<template>
  <div class="v-input-clear">
    <v-input
      ref="input"
      :type="type"
      :id="id"
      :name="name"
      :value="value"
      :label="label"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
    />
  </div>
</template>

<script>
import VInput from "../../atoms/VInput";
export default {
  name: "VInputClear",
  components: { VInput },
  mounted() {
    const self = this;
    this.$refs.input.$on("onchange", () => {
      self.$emit("onchange");
    });
  },
  extends: VInput
};
</script>

<style lang="scss">
.v-input-clear {
}
</style>
