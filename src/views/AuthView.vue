<template>
  <div class="auth-view">
    <div class="logo"><img src="/logo.png" /></div>
    <div class="auth-view-container">
      <div class="auth-form">
        <div class="toggles">
          <router-link tag="div" class="sign-in-toggle" to="/sign-in">
            {{ $t("signIn") }}
          </router-link>
          <router-link tag="div" class="sign-up-toggle" to="/sign-up">
            {{ $t("signUp") }}
          </router-link>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { USER_CHECK_AUTH } from "../services/store/mutation-types";

export default {
  name: "AuthView",
  created() {
    if (localStorage.getItem("pp-u-t-s")) {
      this.$store.dispatch(USER_CHECK_AUTH).then(() => {
        window.postMessage({ authorized: true }, location.href);
      });
    }
  }
};
</script>

<style lang="scss">
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  background-color: $color-bg3;
  .logo {
    img {
      width: 134px;
      margin-bottom: 50px;
      opacity: 0.7;
    }
  }
  &-container {
    max-width: 500px;
    max-height: 500px;
    min-width: 400px;
    min-height: 200px;
  }
  .auth-form {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 30px;
    background-color: #fff;
    color: $color-b2;
    border-radius: 8px;

    button.submit {
      margin: 30px auto 0;
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
        color: $color-w3;
      }
      &:not(.router-link-exact-active) {
        cursor: pointer;
        color: $color-b3;
        font-weight: 500;
      }
    }
  }
}
</style>
