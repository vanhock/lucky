<template>
  <div class="sign-in">
    <form-group ref="form" :loading="loading">
      <v-input-bordered name="email" label="Email" required />
      <v-input-bordered
        name="password"
        type="password"
        label="Password"
        required
      />
    </form-group>
    <v-button class="submit" @click="authorization" :loading="loading"
      >Sign In</v-button
    >
  </div>
</template>

<script>
import _ from "lodash";
import VInputBordered from "../molecules/VInput/VInputBordered";
import VButton from "../atoms/VButton";
import FormGroup from "./FormGroup";
import { Authorization } from "../services/api/UserApi";
import { UserLoginError, UserLoginSuccess } from "../services/notification";

export default {
  name: "SignIn",
  components: { FormGroup, VButton, VInputBordered },
  data: () => ({
    loading: false
  }),
  props: {
    redirectTo: String
  },
  methods: {
    authorization: _.debounce(function() {
      const formValid = this.$refs.form.valid;
      const fields = this.$refs.form.changedItems;
      if (!formValid) {
        this.$refs.form.showValidation();
        return UserLoginError(this, "Form not valid!");
      }
      this.loading = true;
      Authorization(fields, (error, user) => {
        this.loading = false;
        if (error) {
          return UserLoginError(this, error);
        }
        this.$store.dispatch("setUserData", user);
        UserLoginSuccess(this, user.name);
      });
    }, 300)
  }
};
</script>

<style scoped></style>
