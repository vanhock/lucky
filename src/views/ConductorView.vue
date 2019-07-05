<template>
  <div class="conductor-view">
    <empty-placeholder
      v-show="!loading"
      icon="logo"
      :title="(!notFound && titleText) || ''"
      :text="(!notFound && descriptionText) || ''"
      icon-size="120px"
      alignment="top"
    >
      <div
        class="conductor-steps"
        v-show="!notFound && (!authorized || !hasExtension)"
      >
        <div class="step-auth">
          <v-icon
            :icon="stepStyle(authorized).icon"
            :mode="icon.mode"
            :params="{ ...icon.params, stroke: stepStyle(authorized).color }"
          />
          <div class="cont">
            <div class="cont-title">
              {{
                (authorized && "You are authorized") ||
                  ((showSteps && "1. ") || "") + $t("Login to this project")
              }}
            </div>
            <sign-in @success="checkProjectAccess" custom />
          </div>
        </div>
        <div class="step-extension">
          <v-icon
            :icon="stepStyle(hasExtension).icon"
            :mode="icon.mode"
            :params="{ ...icon.params, stroke: stepStyle(hasExtension).color }"
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
      <div class="not-found" v-show="notFound">
        <div class="not-found-image">
          <v-icon icon="project" :params="{ iconSize: '100px' }" />
        </div>
        <div class="not-found-message">{{ currentAccessError }}</div>
      </div>
    </empty-placeholder>
  </div>
</template>

<script>
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
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
  components: { SignIn, VButtonPrimary, VIcon, EmptyPlaceholder },
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
    icon: {
      mode: "feather",
      params: { iconSize: "22px" }
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
      }, 500);
    }
  }
};
</script>

<style lang="scss">
.conductor-view {
  max-width: 900px;
  margin: auto;
  height: 100%;
  display: flex;
  align-items: center;

  .empty-placeholder {
    padding-bottom: 60px;
    .title {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 25px;
      color: $color-b2;
    }
    .text {
      margin-bottom: 48px;
      color: $color-b3;
    }
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
}
.conductor-steps {
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
    &.loading {
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
