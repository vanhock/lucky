<template>
  <div class="v-input-clear">
    <v-input
      :type="type"
      :name="name"
      :label="label"
      :placeholder="placeholder"
      :required="required"
    />
  </div>
</template>

<script>
import VInput from "../../atoms/VInput";
export default {
  name: "VInputWithoutBorder",
  components: { VInput },
  extends: VInput
};
</script>

<style lang="scss">
.v-input-clear {
}
</style>
