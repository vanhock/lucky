<template>
  <div class="sign-up">
    <form-group ref="form" :loading="loading">
      <v-input-bordered name="name" :label="$t('name')" required />
      <v-input-bordered
        name="email"
        :label="$t('email')"
        autocomplete="username"
        required
      />
      <v-input-bordered
        name="password"
        type="password"
        :label="$t('password')"
        autocomplete="new-password"
        required
      />
      <v-input-bordered name="company" :label="$t('company')" />
    </form-group>
    <v-button-primary class="submit" @click="registration" :loading="loading">{{
      $t("signUp")
    }}</v-button-primary>
  </div>
</template>

<script>
import _ from "lodash";
import VInputBordered from "../../molecules/VInput/VInputBordered";
import FormGroup from "../../molecules/FormGroup";
import {
  UserRegistrationError,
  UserRegistrationSuccess
} from "../../services/notification";
import VButtonPrimary from "../../molecules/VButton/VButtonPrimary";
import { USER_REGISTER } from "../../services/store/mutation-types";

export default {
  name: "SignUp",
  components: { VButtonPrimary, FormGroup, VInputBordered },
  data: () => ({
    loading: false
  }),
  props: {
    redirectTo: String
  },
  methods: {
    registration: _.debounce(function() {
      const formValid = this.$refs.form.valid;
      const fields = this.$refs.form.changedItems;
      if (!formValid) {
        this.$refs.form.showValidation();
        return UserRegistrationError(this, "Form not valid!");
      }
      this.loading = true;
      this.$store
        .dispatch(USER_REGISTER, fields)
        .then(success => {
          UserRegistrationSuccess(this, success.message);
          this.loading = false;
          this.$router.push("/sign-in");
        })
        .catch(error => {
          this.loading = false;
          if (error) {
            return UserRegistrationError(this, error);
          }
        });
    }, 300)
  }
};
</script>

<style scoped></style>
