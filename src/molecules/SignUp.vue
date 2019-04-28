<template>
  <div class="sign-up">
    <form-group ref="form" :loading="loading">
      <v-input-bordered name="name" label="Name" required />
      <v-input-bordered name="email" label="Email" required />
      <v-input-bordered
        name="password"
        type="password"
        label="Password"
        required
      />
      <v-input-bordered name="company" label="Company" />
    </form-group>
    <v-button class="submit" @click="registration" :loading="loading"
      >Sign Up</v-button
    >
  </div>
</template>

<script>
import _ from "lodash";
import VInputBordered from "./VInput/VInputBordered";
import VButton from "../atoms/VButton";
import FormGroup from "./FormGroup";
import { Registration } from "../services/api/UserApi";
import {
  UserRegistrationError,
  UserRegistrationSuccess
} from "../services/notification";

export default {
  name: "SignUp",
  components: { FormGroup, VButton, VInputBordered },
  data: () => ({
    loading: false
  }),
  props: {
    redirectTo: String
  },
  methods: {
    registration: _.debounce(function() {
      const formValid = this.$refs.form.valid;
      const fields = this.$refs.form.changedItems;
      if (!formValid) {
        this.$refs.form.showValidation();
        return UserRegistrationError(this, "Form not valid!");
      }
      this.loading = true;
      Registration(fields, (error, success) => {
        this.loading = false;
        if (error) {
          return UserRegistrationError(this, error);
        }
        UserRegistrationSuccess(this, success.message);
      });
    }, 300)
  }
};
</script>

<style scoped></style>
