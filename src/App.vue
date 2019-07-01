<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import VueMoment from "vue-moment";
Vue.use(VueMoment);
import "vuejs-noty/dist/vuejs-noty.css";
export default {
  created() {
    moment.locale(this.$i18n.locale);
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700&subset=cyrillic");
@import url("https://fonts.googleapis.com/css?family=Roboto:400,700,900&subset=cyrillic");
@import "assets/styles/normalize";
@import "assets/styles/animation";
@import "assets/styles/notification";
$color-1: #606060;
$color-2: #ebebeb;
$color-3: #42b983;
$color-4: #070707;
html,
body {
  height: 100%;
}
body {
  background-color: $color-base;
  box-sizing: border-box;
}
#app {
  //font-family: "Roboto", sans-serif;
  font-family: "Montserrat", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $color-b2;
  height: 100%;
}
#nav {
  position: absolute;
  left: 97px;
  top: 39px;
}

.router-link {
  &:not(.router-link-exact-active) {
    cursor: pointer;
  }
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

.website-logo {
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

.clearfix:after {
  content: "";
  display: block;
  clear: both;
}
.hidden {
  position: fixed;
  z-index: -1;
  width: 0;
  height: 0;
  visibility: hidden;
}
[disabled] {
  pointer-events: none;
}

button,
input,
[contenteditable] {
  font-family: "Roboto", sans-serif;
  border: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  &:focus,
  &:active,
  &:visited {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 0;
    outline: 0;
  }
}
</style>
