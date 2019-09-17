<template>
  <div class="conductor-view">
    <div>
      <div class="conductor-view-container" v-if="!notFound" v-show="!loading">
        <div class="conductor-view-auth">
          <router-link to="/" class="pixel-icon"
            ><v-icon icon="logo" :params="{ iconSize: '100px' }"
          /></router-link>
          <div class="conductor-auth-title">
            {{ (!notFound && titleText) || "" }}
          </div>
          <div class="spinner" v-if="authorized && hasExtension">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
          </div>
          <div class="conductor-auth-description">
            {{ (!notFound && descriptionText) || "" }}
          </div>

          <div
            class="conductor-steps"
            v-show="!notFound && (!authorized || !hasExtension)"
          >
            <div class="step-auth" :class="{ ok: authorized }">
              <v-icon
                :icon="stepStyle(authorized).icon"
                :mode="icon.mode"
                :params="{
                  ...icon.params,
                  stroke: stepStyle(authorized).color
                }"
              />
              <div class="cont">
                <div class="cont-title">
                  {{
                    (authorized && "You are authorized") ||
                      ((showSteps && "1. ") || "") + $t("Login to this project")
                  }}
                </div>
                <template v-if="!authorized">
                  <!--<div class="advice-block">
                    <v-icon
                      class="advice-block-icon"
                      :mode="adviceIcon.mode"
                      :params="adviceIcon.params"
                      icon="info"
                    />
                    <div class="advice-block-text">{{ advice }}</div>
                  </div>-->
                  <div
                    class="sign-in-error"
                    v-if="showAuthError && currentAccessError"
                  >
                    {{ currentAccessError }}
                  </div>
                  <sign-in @success="onAuth" @error="onAuthError" custom />
                </template>
              </div>
            </div>
            <div class="step-extension" :class="{ ok: hasExtension }">
              <v-icon
                :icon="stepStyle(hasExtension).icon"
                :mode="icon.mode"
                :params="{
                  ...icon.params,
                  stroke: stepStyle(hasExtension).color
                }"
              />
              <div class="cont">
                <div class="cont-title">
                  {{
                    (hasExtension && "Extension installed") ||
                      ((showSteps && "2. ") || "") +
                        $t("Install our extension by link")
                  }}
                </div>
                <v-button-primary v-if="!hasExtension">{{
                  $t("Download")
                }}</v-button-primary>
              </div>
            </div>
          </div>
        </div>
        <div class="conductor-view-project">
          <div
            class="project-image"
            v-if="currentProject.image"
            :style="{ backgroundImage: `url(${currentProject.image})` }"
            :alt="currentProject.title"
          ></div>
          <div class="project-info-overlay">
            <div class="project-title">
              <v-icon
                :mode="overlayIcon.mode"
                icon="file"
                :params="overlayIcon.params"
              />{{ currentProject.name }}
            </div>
            <div class="project-url">
              <v-icon
                :mode="overlayIcon.mode"
                icon="globe"
                :params="overlayIcon.params"
              />{{ currentProject.url }}
            </div>
            <div class="project-tasks">
              <v-icon
                :mode="overlayIcon.mode"
                icon="check-square"
                :params="overlayIcon.params"
              />0
            </div>
          </div>
        </div>
      </div>

      <div class="not-found" v-if="notFound">
        <div class="not-found-image">
          <v-icon icon="project" :params="{ iconSize: '100px' }" />
        </div>
        <div class="not-found-message">{{ currentAccessError }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  PROJECT_CHECK_ACCESS,
  PROJECT_SET_CURRENT_PROJECT,
  USER_CHECK_AUTH
} from "../services/store/mutation-types";
import config from "../config";
import VIcon from "../atoms/VIcon/VIcon";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import SignIn from "../organisms/authorization/SignIn";
import { mapGetters } from "vuex";
import { getParameterByName } from "../utils";
export default {
  name: "ConductorView",
  components: { SignIn, VButtonPrimary, VIcon },
  created() {
    this.getProject();
    this.tryToAuthByUrlToken();
    const self = this;
    window.addEventListener("message", event => {
      if (event.source !== window) return;
      if (event.data.hasOwnProperty("extensionInstalled")) {
        self.hasExtension = event.data.extensionInstalled;
        self.hasExtension ? self.redirect() : "";
      }
      if (event.data.hasOwnProperty("extensionUninstalled")) {
        self.hasExtension = false;
      }
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.checkExtensionInstalled();
    });

    this.extensionCheckInterval = setInterval(() => {
      this.checkExtensionInstalled();
    }, 2000);
  },
  data: () => ({
    logoParams: {
      iconSize: "20px"
    },
    loading: true,
    authorized: false,
    hasExtension: false,
    accessError: null,
    notFound: false,
    showAuthError: false,
    icon: {
      mode: "feather",
      params: { iconSize: "22px" }
    },
    overlayIcon: {
      mode: "feather",
      params: { iconSize: "16px" }
    },
    adviceIcon: {
      mode: "feather",
      params: { iconSize: "22px", stroke: "#8e8d8d" }
    },
    redirected: false,
    extensionCheckInterval: null
  }),
  computed: {
    ...mapGetters(["currentProject", "isAuthenticated"]),
    titleText() {
      return !this.authorized && !this.hasExtension
        ? this.$t("Two steps to open page")
        : !this.authorized || !this.hasExtension
        ? this.$t("One step to open page")
        : this.$t("Open page");
    },
    descriptionText() {
      return !this.authorized || !this.hasExtension
        ? this.$t("You will redirect to target page after complete these steps")
        : this.$t("Redirecting...");
    },
    showSteps() {
      return !this.authorized && !this.hasExtension;
    },
    currentAccessError() {
      return this.accessError && this.$t(this.accessError);
    },
    advice() {
      if (!this.currentProject) {
        return;
      }
      return this.$t(
        "If you just invited to this project, follow by link on your email"
      );
    }
  },
  props: {
    type: String,
    permalink: String,
    page: String
  },
  methods: {
    getProject() {
      this.$store
        .dispatch(PROJECT_SET_CURRENT_PROJECT, { permalink: this.permalink })
        .then(() => {
          if (!this.isAuthenticated) {
            this.loaded(() => {
              this.authorized = false;
            });
            return;
          }
          return this.checkProjectAccess();
        })
        .catch(error => {
          this.loaded(() => {
            this.accessError = error;
            this.notFound = true;
          });
        });
    },
    checkProjectAccess() {
      this.loading = true;
      return this.$store
        .dispatch(PROJECT_CHECK_ACCESS, { permalink: this.permalink })
        .then(() => {
          this.loaded(() => {
            this.accessError = "";
            return (this.authorized = true);
          });
        })
        .catch(error => {
          this.loaded(() => {
            this.accessError = error;
            return (this.authorized = false);
          });
        });
    },
    checkExtensionInstalled() {
      try {
        window.postMessage({ checkExtension: true }, location.href);
      } catch (e) {
        this.hasExtension = false;
      }
    },
    tryToAuthByUrlToken() {
      const token = getParameterByName("token");
      if (!token || this.isAuthenticated) {
        return;
      }
      this.$store.dispatch(USER_CHECK_AUTH, token).then(() => {
        this.checkProjectAccess();
      });
    },
    onAuth() {
      this.checkProjectAccess();
      this.showAuthError = true;
    },
    onAuthError(e) {
      this.showAuthError = true;
      this.accessError = e;
    },
    stepStyle(state) {
      return (
        (state && { icon: "check-circle", color: "#2ed609" }) || {
          icon: "arrow-right",
          color: "#a035fb"
        }
      );
    },
    loaded(cb) {
      cb();
      const self = this;
      setTimeout(() => {
        self.loading = false;
      }, 400);
    },
    redirect() {
      if (this.authorized && this.hasExtension && !this.redirected) {
        window.postMessage(
          { setExtensionReady: this.currentProject.url },
          location.href
        );
        this.redirected = true;
      }
    }
  }
};
</script>

<style lang="scss">
.conductor-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  & > div {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 583px;
    margin: 0 auto;
    align-items: center;
    flex-direction: column;
    text-align: center;
    background-color: #fff;
    @include box-shadow(medium);
  }
  .pixel-icon {
    margin: 30px 0;
    .v-icon-image {
      width: 100px;
      height: 40px !important;
    }
  }
  .conductor-auth-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 25px;
    color: $color-b2;
  }
  .conductor-auth-description {
    color: $color-b3;
  }

  &-container {
    width: 100%;
    height: 100%;
    display: flex;
  }
  &-project {
    display: flex;
    position: relative;
    flex: 1;
    height: 100%;
    .project-image {
      position: absolute;
      width: 100%;
      height: 100%;
      min-height: 100%;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center top;
      z-index: 1;
      opacity: 0.8;
    }
    .project-info-overlay {
      position: absolute;
      box-sizing: border-box;
      bottom: 0;
      left: 0;
      width: 100%;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 40px;
      z-index: 2;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.58) 100%
      );
      color: #fff;
      font-weight: 600;
      text-align: left;
      font-size: 18px;
      & > * {
        display: flex;
        align-items: center;
        width: 100%;
        height: 25px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &:not(:last-child) {
          margin-bottom: 5px;
        }
        .v-icon {
          margin-right: 10px;
        }
      }
    }
  }
  &-auth {
    display: flex;
    flex: 1.5;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
  }
  .not-found {
    margin-top: 40px;
    display: flex;
    align-items: center;
    flex-direction: column;
    &-image {
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.5;
      margin-bottom: 25px;
    }
    &-message {
      font-weight: 500;
      font-size: 22px;
    }
  }
  .spinner {
    margin: 70px auto 20px;
    width: 70px;
    text-align: center;
  }

  .spinner > div {
    width: 18px;
    height: 18px;
    background-color: $color-w3;

    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  }

  .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }

  @-webkit-keyframes sk-bouncedelay {
    0%,
    80%,
    100% {
      -webkit-transform: scale(0);
    }
    40% {
      -webkit-transform: scale(0.7);
    }
  }

  @keyframes sk-bouncedelay {
    0%,
    80%,
    100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
    40% {
      -webkit-transform: scale(0.7);
      transform: scale(0.7);
    }
  }
}
.conductor-steps {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  min-height: 30%;
  & > div {
    position: relative;
    display: flex;
    align-items: flex-start;
    width: 360px;
    font-size: 20px;

    &:not(:last-child) {
      margin-bottom: 40px;
    }
    .v-icon {
      margin-top: 1px;
      margin-right: 20px;
    }

    .advice-block {
      box-sizing: border-box;
      display: flex;
      margin-top: 15px;
      background-color: $color-highlight;
      color: $color-b2;
      padding: 8px 10px;
      font-size: 12px;
      line-height: 18px;
      border-radius: 5px;
    }

    .cont {
      justify-content: flex-start;
      text-align: left;
      &-title {
        font-weight: 500;
      }
      .v-button {
        margin-top: 20px;
      }
    }
    &.ok {
      .cont-title {
        opacity: 0.7;
      }
    }
    .sign-in {
      width: 265px;
      margin-top: 20px;
      .v-input {
        &:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
  }
  .sign-in-error {
    margin-top: 12px;
    color: $color-w4;
    font-size: 12px;
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes bounce {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1.3);
  }
}
</style>
