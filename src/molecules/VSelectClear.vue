<template>
  <div class="v-select-clear">
    <v-select
      :value="value"
      :name="name"
      :label="label"
      :options="options"
      @change="$emit('change', $event)"
    />
  </div>
</template>

<script>
import VSelect from "../atoms/VSelect";
export default {
  name: "VSelectClear",
  components: { VSelect },
  extends: VSelect
};
</script>

<style scoped></style>
