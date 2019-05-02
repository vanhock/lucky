<template>
  <div class="log-out">
    We log out from account ...
  </div>
</template>

<script>
import { AUTH_LOGOUT } from "../services/store/mutation-types";

export default {
  name: "LogOutView",
  mounted() {
    this.$store.dispatch(AUTH_LOGOUT).then(() => {
      this.$nextTick(() => {
        this.$router.push("/sign-in");
      });
    });
  }
};
</script>

<style scoped></style>
