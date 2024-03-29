<template>
  <div class="sign-in" @keypress.enter="authorization">
    <form-group ref="form" :loading="loading" @change="checkAccountExist">
      <v-input-bordered
        name="email"
        :label="$t('email')"
        autocomplete="username"
        autofocus
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
    <div class="forgot-password" :disabled="loading">
      <p>
        {{ $t("Forgot password? You can ") }}
        <router-link :to="{ name: 'ResetPassword' }">{{
          $t("reset password")
        }}</router-link>
      </p>
    </div>
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
import {
  USER_CHECK_USER_EXIST,
  USER_LOGIN
} from "../../services/store/mutation-types";
import VButtonPrimary from "../../molecules/VButton/VButtonPrimary";

export default {
  name: "SignIn",
  components: { VButtonPrimary, FormGroup, VInputBordered },
  mounted() {
    this.checkAccountExist();
  },
  data: () => ({
    loading: false,
    emailExist: false,
    showEmailExistMessage: false
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
        .dispatch(USER_LOGIN, fields)
        .then(user => {
          this.$emit("success", user);
          if (!this.custom) {
            UserLoginSuccess(this, user.name);
            return setTimeout(() => {
              self.$router.push("/");
            }, 2000);
          }
        })
        .catch(error => {
          this.$emit("error", error);
          if (!this.custom) {
            UserLoginError(this, error);
          }
          this.loading = false;
        });
    }, 300),
    checkAccountExist: _.debounce(function() {
      if (!this.$refs.form.$children[0].$children[0].valid) return;
      this.$store
        .dispatch(USER_CHECK_USER_EXIST, this.$refs.form.changedItems)
        .then(() => {
          this.$emit("error", "");
        })
        .catch(error => {
          this.$emit("error", error);
        });
    }, 600)
  }
};
</script>

<style lang="scss" scoped>
.forgot-password {
  font-size: 12px;
  color: $color-b3;
  .router-link {
    opacity: 0.7;
  }
}
</style>
