<template>
  <div class="sign-in" @keypress.enter="authorization">
    <form-group ref="form" :loading="loading">
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
        autocomplete="current-password"
        required
      />
    </form-group>
    <v-button-primary
      class="submit"
      @click="authorization"
      :loading="loading"
      >{{ $t("signIn") }}</v-button-primary
    >
  </div>
</template>

<script>
import _ from "lodash";
import VInputBordered from "../../molecules/VInput/VInputBordered";
import FormGroup from "../../molecules/FormGroup";
import { UserLoginError, UserLoginSuccess } from "../../services/notification";
import { AUTH_REQUEST } from "../../services/store/mutation-types";
import VButtonPrimary from "../../molecules/VButton/VButtonPrimary";

export default {
  name: "SignIn",
  components: { VButtonPrimary, FormGroup, VInputBordered },
  data: () => ({
    loading: false
  }),
  props: {
    custom: Boolean
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
          this.$emit("success", user);
          if (this.custom) {
            return () => {
              UserLoginSuccess(this, user.name);
              setTimeout(() => {
                self.$router.push("/");
              }, 2000);
            };
          }
        })
        .catch(error => {
          this.loading = false;
          if (this.custom) {
            return () => {
              this.$emit("error", error);
              UserLoginError(this, error);
            };
          }
        });
    }, 300)
  }
};
</script>

<style scoped></style>
