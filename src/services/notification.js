import Vue from "vue";
import VueNoty from "vuejs-noty";
Vue.use(VueNoty, {
  timeout: 1500,
  dismissQueue: true,
  maxVisible: 2,
  progressBar: false,
  layout: "topCenter",
  theme: "mint",
  animation: {
    open: "slide-in-bck-top",
    close: "slide-bck-top"
  }
});

export function notification(instance, type, message) {
  if (!instance || !type || !message) {
    return;
  }
  instance.$noty[type](message);
}

export function UserLoginSuccess(instance, payload) {
  instance.$noty.success("Welcome back, " + payload);
}

export function UserLoginError(instance, payload) {
  instance.$noty.error("Error with login: " + payload);
}

export function UserRegistrationSuccess(instance, payload) {
  instance.$noty.success(payload);
}

export function UserRegistrationError(instance, payload) {
  instance.$noty.error("Error with login: " + payload);
}
