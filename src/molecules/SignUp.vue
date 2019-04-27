<template>
  <div class="sign-in">
    <v-input-bordered name="email" label="Email" />
    <v-input-bordered name="password" label="Password" />
    <v-input-bordered name="company" label="Company" />
    <v-button class="submit" @click="auth">Sign Up</v-button>
  </div>
</template>

<script>
import VInputBordered from "../molecules/VInput/VInputBordered";
import VButton from "../atoms/VButton";
import { Registration } from "../services/api/UserApi";
import { UserRegistrationError } from "../services/notification";

export default {
  name: "SignUp",
  components: { VButton, VInputBordered },
  methods: {
    auth() {
      Registration(
        {
          email: this.email,
          password: this.password,
          company: this.company
        },
        (error, user) => {
          if (error) {
            UserRegistrationError(this, error);
          }
          this.$store.dispatch("setUserData", user);
        }
      );
    }
  }
};
</script>

<style scoped></style>
