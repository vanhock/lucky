import Vue from "vue";
import Router from "vue-router";

import AuthView from "./views/AuthView";

import store from "./services/store/store";
import UserPanelView from "./views/UserPanelView";
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
      component: UserPanelView,
      beforeEnter: ifAuthenticated,
      children: [
        {
          path: "",
          name: "Projects",
          component: () =>
            import(/* webpackChunkName: "ProjectsView" */ "./views/ProjectsView"),
          children: [
            {
              path: ":projectId/pages",
              name: "Pages",
              props: true,
              component: () =>
                import(/* webpackChunkName: "PagesView" */ "./views/PagesView"),
              meta: {
                getter: "currentProject"
              }
            }
          ]
        },

        {
          path: "/trash",
          name: "Trash",
          component: () =>
            import(/* webpackChunkName: "TrashView" */ "./views/TrashView")
        }
      ]
    },
    {
      path: "/inspectors",
      name: "Inspectors",
      component: () =>
        import(/* webpackChunkName: "InspectorsView" */ "./views/InspectorsView")
    },
    {
      path: "/account",
      name: "Account"
    },
    {
      path: "/sign-in",
      component: AuthView,
      beforeEnter: ifNotAuthenticated,
      children: [
        {
          path: "",
          name: "SignIn",
          component: () =>
            import(/* webpackChunkName: "SignIn" */ "./organisms/authorization/SignIn")
        },
        {
          path: "/sign-up",
          name: "SignUp",
          component: () =>
            import(/* webpackChunkName: "SignUp" */ "./organisms/authorization/SignUp")
        }
      ]
    },
    {
      path: "/log-out",
      name: "LogOut",
      component: () =>
        import(/* webpackChunkName: "LogOut" */ "./views/LogOutView")
    }
  ]
});
