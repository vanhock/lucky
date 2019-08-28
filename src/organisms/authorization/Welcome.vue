<template>
  <v-modal
    class="welcome-modal"
    ref="modal"
    :title="modalTitle"
    :description="modalDescription"
    wide
    unable-closing
  >
    <welcome-confirmation
      v-show="!userHasOneTimePassword"
      @success="closeModal"
    />
    <welcome-introducing
      v-show="userHasOneTimePassword"
      @success="closeModal"
    />
  </v-modal>
</template>

<script>
import VModal from "../../molecules/VModal";
import { mapGetters } from "vuex";
import WelcomeConfirmation from "./WelcomeConfirmation";
import WelcomeIntroducing from "./WelcomeIntroducing";

export default {
  name: "Welcome",
  components: { WelcomeIntroducing, WelcomeConfirmation, VModal },
  mounted() {},
  data: () => ({}),
  computed: {
    ...mapGetters(["user", "userStatus", "userHasOneTimePassword"]),
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
  watch: {
    userStatus: function () {
      this.toggleModal()
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
