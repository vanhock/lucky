<template>
  <v-textarea
    class="v-textarea-clear"
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
    @onchange="$emit('onchange')"
  />
</template>

<script>
import VTextarea from "../atoms/VTextarea";
export default {
  name: "VTextareaClear",
  components: { VTextarea },
  extends: VTextarea
};
</script>

<style scoped></style>
