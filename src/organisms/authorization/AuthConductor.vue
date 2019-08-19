<template>
  <v-modal
    class="confirmation-modal"
    ref="modal"
    :title="modalTitle"
    :description="modalDescription"
    wide
    unable-closing
  >
    <div class="confirmation-input">
      <v-input-search
        ref="code"
        name="code"
        mask="number"
        mask-pattern="99-99"
      />
    </div>

    <div class="confirmation-resend">
      <div class="resend-timer" v-show="resendTimer > 0">
        {{ confirmationResendText }} <b>{{ resendTimer }} {{ $t("sec") }}</b>
      </div>
      <v-button-inline
        class="resend-button"
        :disabled="resendTimer > 0"
        @click="sendConfirmationCode(true)"
        ><v-icon
          mode="feather"
          :params="{ iconSize: '14px' }"
          icon="rotate-ccw"
        />&nbsp;{{ $t("Resend") }}</v-button-inline
      >
    </div>
  </v-modal>
</template>

<script>
import VModal from "../../molecules/VModal";
import VInputSearch from "../../molecules/VInput/VInputSearch";
import { mapGetters } from "vuex";
import {
  USER_CHECK_AUTH,
  USER_CONFIRMATION_REQUEST,
  USER_SEND_CONFIRMATION_CODE
} from "../../services/store/mutation-types";
import VButtonInline from "../../molecules/VButton/VButtonInline";
import VIcon from "../../atoms/VIcon/VIcon";
import { notification } from "../../services/notification";
import BackendConfig from "../../../backend/config/config";
export default {
  name: "AuthConductor",
  components: { VIcon, VButtonInline, VInputSearch, VModal },
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (
        mutation.type === USER_CHECK_AUTH &&
        mutation.payload.hasOwnProperty("status") &&
        mutation.payload.status === "new"
      ) {
        /** Try to send confirmation code if not already sent **/
        this.initResendTimer(mutation.payload);
        this.sendConfirmationCode();
        this.$refs.modal.showModal = true;
        this.focusOnField();
        this.$nextTick(() => {
          this.$refs.code.$on("onclick", () => {
            this.confirmationRequest();
          });
        });
      }
    });
  },
  data: () => ({
    resendTimerStart: 0,
    resendTimer: 0,
    resendTimerInterval: null
  }),
  computed: {
    ...mapGetters(["user"]),
    shouldShowModal() {},
    modalTitle() {
      return `${this.$t("Hello")} ${this.user.name}!`;
    },
    modalDescription() {
      return this.$t(
        "Confirmation code sent to your email, type it bellow for activate your account"
      );
    },
    confirmationResendText() {
      return this.$t("You could send code again after:");
    }
  },
  methods: {
    initResendTimer(user) {
      if (!user || !Object.keys(user).length) {
        return;
      }
      const timerCurrentValue = new Date(user.confirmationCodeCreatedAt);
      const timerTimeout =
        BackendConfig.authorization.confirmation_code_resend_timeout;
      const currentDate = new Date(),
        targetAge = (currentDate - timerCurrentValue) / 1000;
      const timer = timerTimeout - targetAge;
      this.resendTimerStart = timer > 0 ? Math.round(timer) : 0;

      if (this.resendTimerStart > 0) {
        this.resendTimer = this.resendTimerStart;
        this.resendTimerInterval = setInterval(() => {
          --this.resendTimer;
          if (this.resendTimer <= 0) {
            return clearInterval(this.resendTimerInterval);
          }
        }, 1000);
      }
    },
    confirmationRequest() {
      if (!this.$refs.code.valid) {
        return (this.confirmationMessageCode = "Code not valid");
      }
      this.$store
        .dispatch(USER_CONFIRMATION_REQUEST, {
          email: this.user.email,
          code: this.$refs.code.currentValue.replace("-", "")
        })
        .then(() => {
          notification(this, "success", this.$t(`Successfully confirmed`));
          this.$refs.modal.showModal = false;
        })
        .catch(error => {
          if (error) {
            this.sendConfirmationCode();
            notification(this, "error", this.$t(error));
          }
        });
    },
    sendConfirmationCode(resend) {
      if (this.resendTimer > 0) {
        return;
      }
      this.$store
        .dispatch(USER_SEND_CONFIRMATION_CODE, {
          email: this.user.email,
          resend: resend
        })
        .then(user => {
          notification(
            this,
            "success",
            `Confirmation Code sent on your email: ${this.user.email}`
          );
          this.initResendTimer(user);
        })
        .catch(error => {
          if (!error) {
            return;
          }
          resend ? notification(this, "error", this.$t(error)) : "";
        });
    },
    focusOnField() {
      const modal = document.querySelector(".pp-modal");
      if (!modal) {
        return;
      }
      const self = this;
      this.$nextTick(() => {
        self.$refs.code.$el.querySelector("input").focus();
      });
      modal.onclick = function() {
        self.$refs.code.$el.querySelector("input").focus();
      };
    }
  }
};
</script>

<style lang="scss">
.confirmation-modal {
  .pp-modal-close {
    display: none;
  }
}
.confirmation-input {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .v-input-search {
    @include box-shadow(medium);
    border-radius: 7px;
    max-width: 190px;
    .v-input {
      margin-bottom: 0;
    }
  }
  &-message {
    margin-left: 5px;
    color: $color-red;
  }
}
.confirmation-resend {
  .resend-timer {
    font-size: 12px;
    margin-bottom: 10px;
    color: $color-b3;
  }
  .resend-button {
    padding-left: 0;
    &[disabled] {
      color: $color-b3;
    }
  }
  .resend-success-message {
    position: absolute;
    left: calc(100% + 20px);
    @include valign();
    color: $color-green;
  }
}
</style>
