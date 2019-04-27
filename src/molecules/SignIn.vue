<template>
  <div class="sign-in">
    <v-input-bordered name="email" label="Email" />
    <v-input-bordered name="password" label="Password" />
    <v-button class="submit" @click="auth">Sign In</v-button>
  </div>
</template>

<script>
import VInputBordered from "../molecules/VInput/VInputBordered";
import VButton from "../atoms/VButton";
export default {
  name: "SignIn",
  components: { VButton, VInputBordered },
  methods: {
    auth() {
      return;
    }
  }
};
</script>

<style scoped></style>
