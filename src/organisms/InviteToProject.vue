<template>
  <div class="invite-to-project">
    <form-group>
      <v-input-search
        ref="emailField"
        button-icon="plus-circle"
        :button-text="$t('Invite')"
        :placeholder="$t('Enter emails with space')"
        @onclick="inviteUser"
        tags-mode
      ></v-input-search>
    </form-group>
    <div class="users-in-project">
      <card-table-list
        v-if="projectUsers.length"
        :title="$t('Users in project')"
      >
        <v-card-table
          :name="projectUsers.name"
          :caption="projectUsers.invitedAt"
          :text="projectUsers.role"
        />
      </card-table-list>
      <empty-placeholder
        :title="$t('Have no users in project yet')"
        icon="users"
        icon-size="50px"
        min-height="140px"
        transparent
      ></empty-placeholder>
    </div>
  </div>
</template>

<script>
import FormGroup from "../molecules/FormGroup";
import VInputSearch from "../molecules/VInput/VInputSearch";
import CardTableList from "../molecules/CardTableList";
import VCardTable from "../molecules/VCard/VCardTable";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import { notification } from "../services/notification";
import { PROJECT_INVITE_TO_PROJECT } from "../services/store/mutation-types";
export default {
  name: "InviteToProject",
  components: {
    EmptyPlaceholder,
    VCardTable,
    CardTableList,
    VInputSearch,
    FormGroup
  },
  props: {
    project: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    projectUsers() {
      return (this.project && this.project.length && this.project.users) || [];
    },
    emails() {
      return this.$refs.emailField;
    }
  },
  methods: {
    inviteUser() {
      if (!this.emails || !this.emails.valid) {
        return notification(this, "error", this.$t("Email not valid"));
      }
      this.$store
        .dispatch(PROJECT_INVITE_TO_PROJECT, { email: this.emails })
        .then(() => {
          this.emails.clearTags();
          return notification(this, "error", this.$t("Invited successfully!"));
        })
        .catch(error => {
          if (error) {
            return notification(this, "error", this.$t(error.message));
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.invite-to-project {
}
</style>
