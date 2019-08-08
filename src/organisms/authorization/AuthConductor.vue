<template>
  <v-modal
    class="confirmation-modal"
    ref="modal"
    :title="modalTitle"
    :description="modalDescription"
    wide
    unable-closing
  >
    <v-input-search
      ref="code"
      name="code"
      class="confirmation-input"
      mask="number"
      mask-pattern="99-99"
    />
    <div class="confirmation-resend">
      <div class="confirmation-resend-timer" v-show="resendTimer > 0">
        {{ resendTimer }}
      </div>
    </div>
  </v-modal>
</template>

<script>
import VModal from "../../molecules/VModal";
import VInputSearch from "../../molecules/VInput/VInputSearch";
import { mapGetters } from "vuex";
import { USER_CHECK_AUTH } from "../../services/store/mutation-types";
export default {
  name: "AuthConductor",
  components: { VInputSearch, VModal },
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (
        mutation.type === USER_CHECK_AUTH &&
        mutation.payload.hasOwnProperty("status") &&
        mutation.payload.status === "new"
      ) {
        this.$refs.modal.showModal = true;
        this.initResendTimer();
        this.$nextTick(() => {
          this.$refs.code.$el.querySelector("input").focus();
        });
      }
    });
  },
  data: () => ({
    resendTimer: 0,
    resendTimerInterval: null
  }),
  computed: {
    ...mapGetters(["user"]),
    shouldShowModal() {},
    modalTitle() {
      return this.$t("Account confirmation");
    },
    modalDescription() {
      return this.$t(
        "Confirmation code sent to your email, type it bellow for activate your account"
      );
    },
    resendTimerStart() {
      if (!this.user || !Object.keys(this.user).length) {
        return;
      }
      const timerCurrentValue = new Date(this.user.confirmationCodeCreatedAt);
      const timerTimeout = this.user.confirmationCodeTimeout;
      const currentDate = new Date(),
        targetAge = (currentDate - timerCurrentValue) / 1000;
      const timer = timerTimeout - targetAge;
      return timer > 0 ? timer : 0;
    }
  },
  methods: {
    initResendTimer() {
      if (this.resendTimerStart > 0) {
        this.resendTimer = this.resendTimerStart;
        this.resendTimerInterval = setInterval(() => {
          --this.resendTimer;
          if (this.resendTimer <= 0) {
            return clearInterval(this.resendTimerInterval);
          }
        }, 1000);
      }
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
  @include box-shadow(medium);
  border-radius: 7px;
  max-width: 190px;
}
</style>
