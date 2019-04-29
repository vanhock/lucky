import Vue from "vue";
import Router from "vue-router";

import AuthView from "./views/AuthView";

import store from "./services/store/store";
import DashboardView from "./views/DashboardView";
Vue.use(Router);
const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next();
    return;
  }
  next("/");
};

const ifAuthenticated = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next();
    return;
  }
  next("/sign-in");
};
export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
      beforeEnter: ifAuthenticated
    },
    {
      path: "/inspectors",
      name: "inspectors",
      component: () =>
        import(/* webpackChunkName: "InspectorsView" */ "./views/InspectorsView")
    },
    {
      path: "/sign-in",
      component: AuthView,
      beforeEnter: ifNotAuthenticated,
      children: [
        {
          path: "",
          name: "signIn",
          component: () =>
            import(/* webpackChunkName: "SignIn" */ "./organisms/SignIn")
        },
        {
          path: "/sign-up",
          name: "signUp",
          component: () =>
            import(/* webpackChunkName: "SignUp" */ "./organisms/SignUp")
        }
      ]
    },
    {
      path: "/log-out",
      name: "logOut",
      component: () =>
        import(/* webpackChunkName: "LogOut" */ "./views/LogOutView")
    }
  ]
});
