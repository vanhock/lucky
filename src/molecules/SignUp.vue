<template>
  <div class="sign-in">
    <v-input name="email" label="Email"></v-input>
    <v-input name="password" label="Password"></v-input>
    <v-input name="company" label="Company"></v-input>
    <v-button class="submit" @click="auth">Sign Up</v-button>
  </div>
</template>

<script>
import VInput from "../atoms/VInput";
import VButton from "../atoms/VButton";
export default {
  name: "SignUp",
  components: { VButton, VInput },
  methods: {
    auth() {
      return;
    }
  }
};
</script>

<style scoped></style>
