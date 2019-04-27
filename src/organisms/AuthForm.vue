<template>
  <div class="auth-form">
    <div class="toggles">
      <div class="sign-in-toggle" :class="{ active: auth }" @click="auth = true">Sign In</div>
      <div class="sign-up-toggle" :class="{ active: !auth }" @click="auth = false">Sign Up</div>
    </div>
    <sign-in v-if="auth" />
    <sign-up v-if="!auth" />
  </div>
</template>

<script>
import SignIn from "../molecules/SignIn";
import SignUp from "../molecules/SignUp";
export default {
  name: "AuthForm",
  components: { SignIn, SignUp },
  data: () => ({
    auth: true
  })
};
</script>

<style lang="scss">
.auth-form {
  width: 100%;
  height: 100%;
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
    &.active {
      color: $color-w1;
    }
    &:not(.active) {
      cursor: pointer;
      color: $color-b3;
      font-weight: 500;
    }
  }
}
</style>
