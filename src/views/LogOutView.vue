<template>
  <div class="log-out">
    {{$t("We are log out from account")}}...
  </div>
</template>

<script>
import { USER_LOGOUT } from "../services/store/mutation-types";

export default {
  name: "LogOutView",
  mounted() {
    this.$store.dispatch(USER_LOGOUT).then(() => {
      this.$nextTick(() => {
        this.$router.push("/sign-in");
      });
    });
  }
};
</script>

<style scoped></style>
