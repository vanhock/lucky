<template>
  <div class="conductor-view">
    <div v-show="!loading">
      <div class="conductor-view-container" v-if="!notFound">
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
        <div class="conductor-view-auth">
          <router-link to="/"
            ><v-icon
              class="pixel-icon"
              icon="logo"
              :params="{ iconSize: '100px' }"
          /></router-link>
          <div class="conductor-auth-title">
            {{ (!notFound && titleText) || "" }}
          </div>
          <div class="spinner">
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
                  <div
                    class="sign-in-error"
                    v-if="showAuthError && currentAccessError"
                  >
                    {{ currentAccessError }}
                  </div>
                  <sign-in @success="onAuth" custom />
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
  PROJECT_SET_CURRENT_PROJECT
} from "../services/store/mutation-types";
import config from "../config";
import VIcon from "../atoms/VIcon/VIcon";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import SignIn from "../organisms/authorization/SignIn";
import { mapGetters } from "vuex";
export default {
  name: "ConductorView",
  components: { SignIn, VButtonPrimary, VIcon },
  created() {
    this.getProject();
  },
  mounted() {
    this.$nextTick(() => {
      this.checkExtensionInstalled();
    });

    setInterval(() => {
      this.checkExtensionInstalled();
    }, 500);
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
    }
  }),
  computed: {
    ...mapGetters(["currentProject"]),
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
      this.hasExtension =
        document.querySelector(`[extension-id=${config.extensionId}]`) || false;
    },
    onAuth() {
      this.checkProjectAccess();
      this.showAuthError = true;
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
    }
  }
};
</script>

<style lang="scss">
.conductor-view {
  max-width: 1060px;
  margin: auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  & > div {
    display: flex;
    width: 100%;
    height: 100%;
    max-height: 80%;
    min-height: 583px;
    margin: 0 auto;
    align-items: center;
    flex-direction: column;
    text-align: center;
    border-radius: 7px;
    background-color: #fff;
    @include box-shadow(medium);
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
      border-radius: 7px 0 0 7px;
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
        rgba(0, 0, 0, 1) 100%
      );
      border-radius: 0 0 0 7px;
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
  margin-top: 35px;
  & > div {
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
