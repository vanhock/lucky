<template>
  <v-modal
    ref="modal"
    :title="modalTitle"
    :description="modalDescription"
    wide
    unable-closing
  >
    <v-input-search class="confirmation-input" />
  </v-modal>
</template>

<script>
import VModal from "../../molecules/VModal";
import VInputSearch from "../../molecules/VInput/VInputSearch";
import { mapGetters } from "vuex";
export default {
  name: "AuthConductor",
  components: { VInputSearch, VModal },
  mounted() {
    if (this.user && this.user.status === "new") {
      this.$refs.modal.showModal();
    }
  },
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
    }
  }
};
</script>

<style lang="scss" scoped>
.confirmation-input {
}
</style>
