<template>
  <div class="sign-in">
    <v-input-bordered name="email" label="Email" />
    <v-input-bordered  name="password" label="Password" />
    <v-input-bordered  name="company" label="Company" />
    <v-button class="submit" @click="auth">Sign Up</v-button>
  </div>
</template>

<script>
import VInputBordered from "../molecules/VInput/VInputBordered";
import VButton from "../atoms/VButton";
export default {
  name: "SignUp",
  components: { VButton, VInputBordered },
  methods: {
    auth() {
      return;
    }
  }
};
</script>

<style scoped></style>
