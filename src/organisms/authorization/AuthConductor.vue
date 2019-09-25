<template>
  <div>
    <v-modal
      class="welcome-modal"
      ref="modal"
      :title="modalTitle"
      :description="modalDescription"
      :wide="!userHasOneTimePassword"
      unable-closing
    >
      <auth-conductor-confirm
        v-show="!userHasOneTimePassword"
        @success="closeModal"
      />
      <auth-conductor-set
        v-show="userHasOneTimePassword"
        @success="closeModal"
      />
    </v-modal>
    <auth-conductor-reset-password />
  </div>
</template>

<script>
import VModal from "../../molecules/VModal";
import { mapGetters } from "vuex";
import AuthConductorConfirm from "./AuthConductorConfirm";
import AuthConductorSet from "./AuthConductorSet";
import AuthConductorResetPassword from "./AuthConductorResetPassword";

export default {
  name: "AuthConductor",
  components: {
    AuthConductorResetPassword,
    AuthConductorSet,
    AuthConductorConfirm,
    VModal
  },
  mounted() {},
  data: () => ({}),
  computed: {
    ...mapGetters(["user", "userStatus", "userHasOneTimePassword"]),
    modalTitle() {
      return `${this.$t("Welcome")}${
        this.user && this.user.name ? " " + this.user.name : ""
      }!`;
    },
    modalDescription() {
      return !this.userHasOneTimePassword
        ? this.$t(
            "Confirmation code sent to your email, type it bellow for activate your account"
          )
        : this.$t(`Introduce yourself`);
    },
    confirmationResendText() {
      return this.$t("You could send code again after:");
    }
  },
  watch: {
    userStatus: function() {
      this.toggleModal();
    }
  },
  methods: {
    closeModal() {
      if (!this.$refs.modal) return;
      this.$refs.modal.showModal = false;
    },
    toggleModal() {
      this.$refs.modal.showModal = this.userStatus && this.userStatus === "new";
    }
  }
};
</script>

<style lang="scss">
.welcome-modal {
  .pp-modal-close {
    display: none;
  }
}
</style>
