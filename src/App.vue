<template>
  <div id="app">
    <v-header>
      <div id="nav">
        <router-link to="/" exact>Home</router-link>
        <router-link to="/about">About</router-link>
      </div>
      <div class="logo"><img src="./assets/fav.png" /></div>
      <div class="sign-in">Sign in</div>
    </v-header>
    <router-view />
  </div>
</template>

<script>
import PsdMixin from "./mixins/PsdMixin.vue";
import RecomendMixin from "./mixins/RecommendMixin";
import VHeader from "./components/VHeader.vue";
export default {
  components: { VHeader },
  mixins: [RecomendMixin]
};
</script>

<style lang="scss">
@import "./assets/normalize.scss";
$color-1: #606060;
$color-2: #ebebeb;
$color-3: #42b983;
$color-4: #070707;
body {
  background-color: $color-1;
  box-sizing: border-box;
}
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #fff;
}
#nav {
  position: absolute;
  left: 97px;
  top: 39px;
}

#nav a {
  font-weight: normal;
  color: $color-2;
  text-decoration: none;
  &:not(:last-child) {
    margin-right: 23px;
  }
}

#nav a.router-link-exact-active {
  color: $color-3;
}

.logo {
  position: absolute;
  width: 70px;
  height: 60px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    width: 100%;
    height: 100%;
  }
}

.sign-in {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;  
  width: 124px;
  height: 89px;
  right: 0;
  top: 0;
  background-color: $color-4;
  color: $color-2;
}
</style>
