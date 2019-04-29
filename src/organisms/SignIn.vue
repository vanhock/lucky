<template>
  <div class="sign-in">
    <form-group ref="form" :loading="loading">
      <v-input-bordered name="email" label="Email" autocomplete="username" required />
      <v-input-bordered
        name="password"
        type="password"
        label="Password"
        autocomplete="current-password"
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
import FormGroup from "../molecules/FormGroup";
import { UserLoginError, UserLoginSuccess } from "../services/notification";
import { AUTH_REQUEST } from "../services/store/mutation-types";

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
      const self = this;
      const formValid = this.$refs.form.valid;
      const fields = this.$refs.form.changedItems;
      if (!formValid) {
        this.$refs.form.showValidation();
        return UserLoginError(this, "Form not valid!");
      }
      this.loading = true;
      this.$store
        .dispatch(AUTH_REQUEST, fields)
        .then(user => {
          UserLoginSuccess(this, user.name);
          setTimeout(() => {
            self.$router.push("/");
          }, 2000);
        })
        .catch(error => {
          this.loading = false;
          UserLoginError(this, error);
        });
    }, 300)
  }
};
</script>

<style scoped></style>
