import Vue from "vue";
import Router from "vue-router";
import Home from "./views/HomeView.vue";
import ViewScreen from "./views/InspectorsView.vue";
import AuthView from "./views/AuthView";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/homepage",
      name: "home",
      component: Home
    },
    {
      path: "/view",
      name: "view",
      component: ViewScreen
    },
    {
      path: "/",
      name: "auth",
      component: AuthView
    }
  ]
});
