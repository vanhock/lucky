<template>
  <div class="auth-form">
    <div class="toggles">
      <router-link tag="div" class="sign-in-toggle" to="/sign-in">
        Sign In
      </router-link>
      <router-link tag="div" class="sign-up-toggle" to="/sign-up">
        Sign Up
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
import SignIn from "./SignIn";
import SignUp from "./SignUp";
export default {
  name: "AuthForm"
};
</script>

<style lang="scss">
.auth-form {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 30px;
  background-color: #fff;
  color: $color-b2;

  button.submit {
    margin-top: 30px;
  }

  .v-input {
    margin-bottom: 20px;
  }
}
.toggles {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  margin-bottom: 20px;
  & > div {
    margin: 0 10px;
    font-weight: bold;
    font-size: 18px;
    &.router-link-exact-active {
      color: $color-w1;
    }
    &:not(.router-link-exact-active) {
      cursor: pointer;
      color: $color-b3;
      font-weight: 500;
    }
  }
}
</style>
