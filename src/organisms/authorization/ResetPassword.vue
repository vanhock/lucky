<template>
  <div class="reset-password">
    <div class="header" v-if="!sent">
      {{ $t("Send request for reset current password") }}
    </div>
    <p v-if="sent">
      {{
        $t(
          "Password reset link sent on this email. Follow the link to change password"
        )
      }}
    </p>
    <form-group ref="form" :loading="loading" v-if="!sent">
      <v-input-bordered name="email" :label="$t('email')" required />
    </form-group>
    <v-button-primary
      @click="resetPasswordRequest"
      :loading="loading"
      v-if="!sent"
      >{{ $t("Send request") }}</v-button-primary
    >
    <v-button-inline @click="sent = false" v-if="sent"
      >{{$t("Resend")}}</v-button-inline
    >
  </div>
</template>

<script>
import FormGroup from "../../molecules/FormGroup";
import {
  USER_CHECK_USER_EXIST,
  USER_RESET_PASSWORD
} from "../../services/store/mutation-types";
import { notification } from "../../services/notification";
import VInputBordered from "../../molecules/VInput/VInputBordered";
import VButtonPrimary from "../../molecules/VButton/VButtonPrimary";
import VButtonInline from "../../molecules/VButton/VButtonInline";
export default {
  name: "ResetPassword",
  components: { VButtonInline, VButtonPrimary, VInputBordered, FormGroup },
  data: () => ({
    loading: false,
    sent: false
  }),
  methods: {
    resetPasswordRequest() {
      const formValid = this.$refs.form.valid;
      const fields = this.$refs.form.changedItems;
      if (!formValid) {
        notification(this, "error", this.$t("Form not valid"));
      }
      this.loading = true;
      this.$store
        .dispatch(USER_CHECK_USER_EXIST, { email: fields.email })
        .then(() => {
          this.$store
            .dispatch(USER_RESET_PASSWORD, { email: fields.email })
            .then(() => {
              notification(
                this,
                "success",
                `${this.$t("Password reset link sent on")} ${fields.email}`
              );
              this.sent = true;
              this.loading = false;
            })
            .catch(error => {
              error && notification(this, "error", this.$t(error));
              this.loading = false;
            });
        })
        .catch(error => {
          error && notification(this, "error", this.$t(error));
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.reset-password {
  font-size: 14px;
  text-align: center;
  line-height: 20px;

  .header,
  p {
    margin-bottom: 20px;
  }

  .v-button {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
