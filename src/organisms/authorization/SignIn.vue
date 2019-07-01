<template>
  <div class="sign-in" @keypress.enter="authorization">
    <form-group
      ref="form"
      :loading="loading"
      @change="changeValid = Math.random()"
    >
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
      :disabled="!formValid"
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
    loading: false,
    changeValid: 0
  }),
  computed: {
    formValid() {
      return this.changeValid && this.$refs.form.valid;
    }
  },
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
            //self.$router.push("/");
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
