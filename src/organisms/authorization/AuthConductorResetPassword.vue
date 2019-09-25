<template></template>

<script>
import { mapGetters } from "vuex";
import { getParameterByName } from "../../utils";
import {
  USER_CHANGE_USER_INFO,
  USER_CHECK_AUTH,
  USER_RESET_ACCOUNT_CREDENTIALS
} from "../../services/store/mutation-types";
import { notification } from "../../services/notification";

export default {
  name: "AuthConductorResetPassword",
  created() {
    this.resetPassword();
  },
  computed: {
    ...mapGetters(["isAuthenticated"])
  },
  methods: {
    resetPassword() {
      const token = getParameterByName("token");
      const resetPassword = getParameterByName("resetPassword");
      if (this.isAuthenticated || !token || !resetPassword) {
        return;
      }
      this.$store.dispatch(USER_CHECK_AUTH, token).then(() => {
        this.$store.dispatch(USER_RESET_ACCOUNT_CREDENTIALS).then(() => {
          notification(this, "success", this.$t("Password was reset"));
        });
      });
    }
  }
};
</script>

<style scoped></style>
