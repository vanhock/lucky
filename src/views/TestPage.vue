<template>
  <v-header>
    <div id="nav">
      <router-link to="/" exact>Home</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <div class="logo"><img src="./assets/fav.png" /></div>
    <div class="sign-in">Sign in</div>
  </v-header>
</template>

<script>
import VHeader from "./components/VHeader.vue";
export default {
  name: "TestPage",
  components: { VHeader }
};
</script>

<style scoped></style>
