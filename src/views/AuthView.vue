<template>
  <div class="auth-view">
    <div class="auth-view-container">
      <auth-form class="auth-view-form"></auth-form>
    </div>
  </div>
</template>

<script>
import AuthForm from "../organisms/AuthForm";
export default {
  name: "SignInView",
  components: { AuthForm }
};
</script>

<style lang="scss" scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: $color-bg3;
  &-container {
    max-width: 500px;
    max-height: 500px;
    min-width: 400px;
    min-height: 200px;
  }
  &-form {
    border-radius: 8px;
  }
}
</style>
