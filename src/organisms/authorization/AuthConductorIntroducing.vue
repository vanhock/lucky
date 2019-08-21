<template>
  <div class="introducing">
    <form-group ref="form">
      <v-input-bordered name="name" :label="$t('Your Name')" required />
      <v-input-bordered name="password" :label="$t('Create password')" required />
      <v-button-primary class="introducing-post">{{
        $t("Save and start")
      }}</v-button-primary>
    </form-group>
  </div>
</template>

<script>
import FormGroup from "../../molecules/FormGroup";
import VInputBordered from "../../molecules/VInput/VInputBordered";
import VButtonPrimary from "../../molecules/VButton/VButtonPrimary";
import {notification} from "../../services/notification";
export default {
  name: "AuthConductorIntroducing",
  components: { VButtonPrimary, VInputBordered, FormGroup },
  methods: {
    saveUserData() {
      if(!this.$refs.form.valid) {
        return notification(this, "error", this.$t("Form not valid"))
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
