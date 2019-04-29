<template>
  <div class="log-out">
    We log out from account ...
  </div>
</template>

<script>
export default {
  name: "LogOutView",
  mounted() {
    this.$store.dispatch("AUTH_LOGOUT").then(() => {
      this.$nextTick(() => {
        this.$router.push("/sign-in");
      });
    });
  }
};
</script>

<style scoped></style>
