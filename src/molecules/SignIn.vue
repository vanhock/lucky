<template>
  <div class="sign-in">
    <form-group>
      <v-input-bordered name="email" label="Email" required />
      <v-input-bordered
        name="password"
        type="password"
        label="Password"
        required
      />
    </form-group>
    <v-button class="submit" @click="auth">Sign In</v-button>
  </div>
</template>

<script>
import VInputBordered from "../molecules/VInput/VInputBordered";
import VButton from "../atoms/VButton";
import FormGroup from "./FormGroup";
export default {
  name: "SignIn",
  components: { FormGroup, VButton, VInputBordered },
  methods: {
    auth() {
      return;
    }
  }
};
</script>

<style scoped></style>
