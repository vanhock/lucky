<template>
  <div class="introducing">
    <form-group ref="form">
      <v-input-bordered name="name" :label="$t('Your Name')" required />
      <v-input-bordered
        name="password"
        :label="$t('Create password')"
        required
      />
      <v-button-primary class="introducing-post" @click="saveUserData">{{
        $t("Save and start")
      }}</v-button-primary>
    </form-group>
  </div>
</template>

<script>
import FormGroup from "../../molecules/FormGroup";
import VInputBordered from "../../molecules/VInput/VInputBordered";
import VButtonPrimary from "../../molecules/VButton/VButtonPrimary";
import { notification } from "../../services/notification";
import { USER_CHANGE_USER_INFO } from "../../services/store/mutation-types";
export default {
  name: "WelcomeIntroducing",
  components: { VButtonPrimary, VInputBordered, FormGroup },
  methods: {
    saveUserData() {
      if (!this.$refs.form.valid) {
        return notification(this, "error", this.$t("Form not valid"));
      }
      this.$store
        .dispatch(USER_CHANGE_USER_INFO, this.$refs.form.changedItems)
        .then(() => {
          notification(this, "success", this.$t("You ready to go"));
          this.$emit("success");
        })
        .catch(error => {
          notification(this, "error", this.$t(error));
        });
    }
  }
};
</script>

<style lang="scss" scoped></style>
