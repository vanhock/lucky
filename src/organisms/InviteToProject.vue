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
    <template v-if="allowedInvite">
      <div class="invite-to-project-title">{{ $t("Invite to Project") }}</div>
      <v-input-search
        name="email"
        class="invite-by-email"
        :validation-message="$t('Type real email')"
        ref="emailField"
        required
        :placeholder="$t('Enter email for invite')"
      ></v-input-search>

      <div class="users-in-project">
        <card-table-list
          v-if="projectUsers.length"
          :title="$t('Members of this Project:')"
        >
          <v-card-table
            v-for="user in projectUsers"
            :key="user.id"
            :name="`${user.name || ''} ${user.email}`"
            :caption="user.invitedAt"
            clear
          >
            <div class="role-toggle">
              <v-select-clear
                name="role"
                :options="roles"
                :value="user.role"
                :disabled="user.role === 'owner'"
                @change="setUserAccess(user.email, $event)"
              />
            </div>

            <v-toggle
              class="revoke-access"
              :disabled="user.role === 'owner'"
              mode="feather"
              icon="x-circle"
              hide-text
              :params="{ iconSize: '18px', stroke: '#333' }"
              @click="revokeUserAccess(user.id)"
            />
          </v-card-table>
        </card-table-list>
        <empty-placeholder
          v-if="!projectUsers.length"
          :title="$t('Have no users in the Project yet')"
          icon="users"
          icon-size="50px"
          min-height="140px"
          transparent
        ></empty-placeholder>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import config from "../config";

import VInputSearch from "../molecules/VInput/VInputSearch";
import CardTableList from "../molecules/CardTableList";
import VCardTable from "../molecules/VCard/VCardTable";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import { notification } from "../services/notification";
import {
  PROJECT_GET_PROJECT_USERS,
  PROJECT_INVITE_TO_PROJECT,
  PROJECT_REVOKE_USER_ACCESS
} from "../services/store/mutation-types";
import VInputClear from "../molecules/VInput/VInputClear";
import VIcon from "../atoms/VIcon/VIcon";
import VSelectClear from "../molecules/VSelectClear";
import VToggle from "../atoms/VToggle";

export default {
  name: "InviteToProject",
  components: {
    VToggle,
    VSelectClear,
    VIcon,
    VInputClear,
    EmptyPlaceholder,
    VCardTable,
    CardTableList,
    VInputSearch
  },
  created() {
    this.$store
      .dispatch(PROJECT_GET_PROJECT_USERS, { id: this.project.id })
      .catch(error => {
        notification(this, "error", error);
      });

    config.projectRoles.forEach(role => {
      this.roles.push({
        name: this.$t(role),
        value: role,
        disabled: role === "owner"
      });
    });
    this.roles.sort((x, y) => {
      return x.disabled === y.disabled ? 0 : x.disabled ? 1 : -1;
    });
  },
  mounted() {
    const self = this;
    this.emails.$on("onclick", () => {
      self.inviteUser();
    });
  },
  props: {
    project: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    copied: false,
    copyTimer: 3000,
    roles: []
  }),
  computed: {
    ...mapGetters(["user"]),
    projectUsers() {
      return (
        (this.project &&
          Object.keys(this.project).length &&
          this.project.users) ||
        []
      );
    },
    emails() {
      return this.$refs.emailField;
    },
    publicUrl() {
      return this.project
        ? `${config.apiUrl}/i/p/${this.project.permalink}`
        : "";
    },
    allowedInvite() {
      if (!this.project || !this.project.hasOwnProperty("users")) return;
      return this.project.users.some(user => {
        if (
          user.id === this.user.id &&
          (user.role === "owner" || user.role === "admin")
        ) {
          return true;
        }
      });
    }
  },
  methods: {
    inviteUser() {
      if (!this.emails || !this.emails.isValid) {
        return notification(this, "error", this.$t("Email not valid"));
      }
      this.$store
        .dispatch(PROJECT_INVITE_TO_PROJECT, {
          email: this.emails.currentValue,
          id: this.project.id,
          role: "client"
        })
        .then(() => {
          this.emails.clear();
          return notification(this, "error", this.$t("Invited successfully!"));
        })
        .catch(error => {
          if (error) {
            return notification(this, "error", this.$t(error.message));
          }
        });
    },
    setUserAccess(userEmail, value) {
      if (!userEmail || !value) {
        return;
      }
      this.$store
        .dispatch(PROJECT_INVITE_TO_PROJECT, {
          email: userEmail,
          id: this.project.id,
          role: value.role
        })
        .then(() => {
          return notification(
            this,
            "error",
            this.$t("Access updated successfully!")
          );
        })
        .catch(error => {
          if (error) {
            return notification(this, "error", this.$t(error.message));
          }
        });
    },
    revokeUserAccess(userId) {
      this.$store
        .dispatch(PROJECT_REVOKE_USER_ACCESS, {
          id: this.project.id,
          userId: userId
        })
        .then(() => {
          return notification(this, "error", this.$t("Access revoked!"));
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
    margin: 45px 0 10px;
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
  .users-in-project {
    .v-card-actions {
      right: 15px;
    }

    .v-card-image-container,
    .v-card-text-container {
      height: 50px;
    }

    .v-card-content {
      box-shadow: none;
    }

    .card-table-list {
      .title {
        text-align: center;
        color: $color-b3;
      }
    }

    .card-table-list-container {
      margin-top: 15px;
      max-height: 200px;
      overflow-x: hidden;
      overflow-y: auto;
      @include scroll();
    }

    .v-card-text-container {
      & > * {
        color: $color-b2;
      }
      .name {
        font-size: 12px;
        padding: 0;
        font-weight: 500;
      }
    }
    .role-toggle {
      display: flex;
      align-items: center;
      cursor: default;
    }
    .revoke-access {
      opacity: 0.5;
      &[disabled] {
        opacity: 0.2;
      }
    }
  }
}
</style>
