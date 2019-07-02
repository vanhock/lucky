<template>
  <div class="conductor-view">
    <empty-placeholder
      icon="logo"
      :title="titleText"
      :text="$t('You will redirect to target page after complete these steps')"
      icon-size="120px"
      alignment="top"
    >
      <div class="conductor-steps">
        <div class="step-auth" :class="{ loading: !authorized }">
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
            <sign-in @callback="authToProject" custom />
          </div>
        </div>
        <div class="step-extension" :class="{ loading: !hasExtension }">
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
    </empty-placeholder>
  </div>
</template>

<script>
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import {
  AUTH_AS_CLIENT,
  AUTH_SUCCESS,
  PROJECT_CHECK_ACCESS,
  PROJECT_SET_CURRENT_PROJECT
} from "../services/store/mutation-types";
import config from "../config";
import VIcon from "../atoms/VIcon/VIcon";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import SignIn from "../organisms/authorization/SignIn";

export default {
  name: "ConductorView",
  components: { SignIn, VButtonPrimary, VIcon, EmptyPlaceholder },
  created() {
    this.getProjectAndCheckAuth();
  },
  mounted() {
    this.checkExtensionInstalled();
  },
  data: () => ({
    currentProject: null,
    logoParams: {
      iconSize: "20px"
    },
    authorized: false,
    hasExtension: false,
    accessError: null,
    icon: {
      mode: "feather",
      params: { iconSize: "22px" }
    }
  }),
  computed: {
    titleText() {
      return !this.authorized && !this.hasExtension
        ? this.$t("Two steps to open page")
        : !this.authorized || !this.hasExtension
        ? this.$t("One step to open page")
        : this.$t("Open page");
    },
    showSteps() {
      return !this.authorized && !this.hasExtension;
    }
  },
  props: {
    type: String,
    permalink: String,
    page: String
  },
  methods: {
    getProjectAndCheckAuth() {
      this.$store
        .dispatch(PROJECT_SET_CURRENT_PROJECT, { permalink: this.permalink })
        .then(project => {
          this.currentProject = project;
          if (project.id && project.name) {
            this.authorized = true;
          }
        });
    },
    authToProject(fields) {
      this.$store
        .dispatch(AUTH_AS_CLIENT, fields)
        .then(user => {
          this.$store
            .dispatch(PROJECT_CHECK_ACCESS, {
              permalink: this.permalink,
              email: fields.email,
              userId: user.id
            })
            .then(project => {
              this.$store.commit(AUTH_SUCCESS, user);
              this.currentProject = project;
              this.authorized = true;
            });
        })
        .catch(error => {
          this.accessError = error;
        });
    },
    checkExtensionInstalled() {
      setTimeout(() => {
        this.hasExtension =
          document.querySelector(`[extension-id=${config.extensionId}]`) ||
          false;
      }, 100);
    },
    stepStyle(state) {
      return (
        (state && { icon: "check-circle", color: "#2ed609" }) || {
          icon: "arrow-right",
          color: "#a035fb"
        }
      );
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
