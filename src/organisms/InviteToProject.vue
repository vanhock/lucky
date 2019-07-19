<template>
  <div class="invite-to-project">
    <div class="copy-public-link" @click="copyProjectLink">
      <v-input-clear
        name="permalink"
        :label="$t('Copy public link')"
        :value="publicUrl"
        disabled
      />
      <v-icon mode="feather" icon="link" />
      <div class="copied" v-show="copied">
        {{ $t("Link copied to clipboard!") }}
      </div>
    </div>
    <div class="invite-to-project-title">{{ $t("Invite to Project") }}</div>
    <v-input-search
      name="invite"
      class="invite-by-email"
      ref="emailField"
      :placeholder="$t('Enter email for invite')"
      @onclick="inviteUser"
    ></v-input-search>

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
        :title="$t('Have no users in the Project yet')"
        icon="users"
        icon-size="50px"
        min-height="140px"
        transparent
      ></empty-placeholder>
    </div>
  </div>
</template>

<script>
import config from "../config";

import VInputSearch from "../molecules/VInput/VInputSearch";
import CardTableList from "../molecules/CardTableList";
import VCardTable from "../molecules/VCard/VCardTable";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import { notification } from "../services/notification";
import { PROJECT_INVITE_TO_PROJECT } from "../services/store/mutation-types";
import VInputClear from "../molecules/VInput/VInputClear";
import VIcon from "../atoms/VIcon/VIcon";

export default {
  name: "InviteToProject",
  components: {
    VIcon,
    VInputClear,
    EmptyPlaceholder,
    VCardTable,
    CardTableList,
    VInputSearch
  },
  props: {
    project: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    copied: false,
    copyTimer: 3000
  }),
  computed: {
    projectUsers() {
      return (this.project && this.project.length && this.project.users) || [];
    },
    emails() {
      return this.$refs.emailField;
    },
    publicUrl() {
      return this.project
        ? `${config.apiUrl}/i/p/${this.project.permalink}`
        : "";
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
    },
    copyProjectLink() {
      const self = this;
      const el = document.getElementById("input-permalink");
      el.removeAttribute("disabled");
      el.select();
      document.execCommand("copy");
      el.setAttribute("disabled", "disabled");
      this.copied = true;
      setTimeout(() => {
        self.copied = false;
      }, this.copyTimer);
    }
  }
};
</script>

<style lang="scss">
.invite-to-project {
  &-title {
    font-weight: bold;
    margin: 35px 0 10px;
    color: $color-b3;
    font-size: 14px;
  }
  .copy-public-link {
    position: relative;
    .v-input-clear {
      background-color: $color-highlight;
      border-radius: 7px;
      padding-left: 15px;
      margin-top: 25px;
      cursor: pointer;
      .label {
        top: -35px;
        left: 0;
        color: $color-b3;
        font-weight: bold;
      }
      .input input {
        padding: 5px 10px 5px 6px;
      }
    }
    .v-icon {
      position: absolute;
      @include valign();
      right: 30px;
      cursor: pointer;
    }
    .copied {
      position: absolute;
      top: -25px;
      right: 0;
      font-size: 12px;
      color: $color-green;
    }
  }
  .invite-by-email {
    margin-top: 5px;
    @include box-shadow(medium);
    border-radius: 7px;
    margin-bottom: 30px;
    font-size: 14px;
    .input {
      font-size: 18px;
    }
  }
}
</style>
