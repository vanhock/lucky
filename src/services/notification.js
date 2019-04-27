import Vue from "vue";
import VueNoty from "vuejs-noty";

Vue.use(VueNoty, {
  timeout: 4000,
  progressBar: false,
  layout: "topCenter",
  theme: "nest"
});

export function UserLoginSuccess(instance, payload) {
  instance.$noty.success("Welcome back, " + payload);
}

export function UserLoginError(instance, payload) {
  instance.$noty.error("Error with login: " + payload);
}

export function UserRegistrationSuccess(instance, payload) {
  instance.$noty.success("Registration success!", {
    callbacks: {
      afterShow: () => {
        if (!payload) {
          return;
        }
        document.location = payload;
      }
    }
  });
}

export function UserRegistrationError(instance, payload) {
  instance.$noty.error("Error with login: " + payload);
}
