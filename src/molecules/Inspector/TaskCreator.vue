<template>
  <div class="task-creator">
    <v-toggle
      class="task-creator-close"
      icon="cheveron-outline-left"
      :text="$t('Back')"
      @click="cancelCreating"
      v-hotkey="{ esc: cancelCreating }"
    ></v-toggle>
    <div class="task-creator-tools">
      <v-toggle-selector>
        <v-toggle icon="arrow-down-left" mode="feather" :params="toolParams" />
        <v-toggle icon="square" mode="feather" :params="toolParams" />
        <v-toggle icon="circle" mode="feather" :params="toolParams" />
        <v-toggle icon="edit-3" mode="feather" :params="toolParams" />
      </v-toggle-selector>
      <v-toggle icon="text-box" icon-size="20px" />
      <v-toggle-selector>
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#FF0000', iconSize: '24px' }"
          icon-size="24px"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#fffb25', iconSize: '24px' }"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#3714ff', iconSize: '24px' }"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#2ed609', iconSize: '24px' }"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#000', iconSize: '24px' }"
        />
      </v-toggle-selector>
    </div>
    <div class="task-creator-block">
      <form-group
        ref="quickCreateForm"
        class="task-form"
        @change="onChangeName"
        editable-mode
      >
        <v-input-clear
          id="pp-task-creator-input"
          ref="quickCreateInputName"
          class="task-creator-input"
          theme="dark"
          name="name"
          :value="currentFormName"
          :placeholder="$t('Task name here')"
        />
      </form-group>
      <v-modal
        ref="operationalModal"
        class="task-creator-modal"
        :title="$t('Create task - editor')"
        @open="updateCurrentForm"
        @close="
          updateCurrentForm();
          allFieldsModalOpen = false;
        "
        wide
      >
        <content-with-sidebar>
          <div slot="sidebar">
            {{ currentProject && currentProject.name }}
          </div>
          <form-group ref="allFieldsForm">
            <v-input-bordered
              name="name"
              ref="createInputName"
              :value="currentFormName"
              :label="$t('Task name')"
            />
            <v-textarea-clear
              name="text"
              :value="currentFormText"
              :label="$t('Task description')"
            />
          </form-group>
        </content-with-sidebar>

        <div class="task-creator-modal-buttons">
          <v-button-inline @click="closeAllFieldsModal">{{
            $t("Back")
          }}</v-button-inline>
          <v-button-primary @click="createTask">{{
            $t("Create task")
          }}</v-button-primary>
        </div>
      </v-modal>
    </div>
    <div class="task-creator-destination">
      <v-toggle class="chevron" icon="cheveron-down" disabled />
      <div class="destination-block">
        <div class="destination-block-name">
          Share to
          <v-toggle
            icon="slack"
            :text="$t('Slack')"
            mode="feather"
            :params="{ stroke: '#d0d0d0', color: '#d0d0d0', iconSize: '14px' }"
            text-size="9px"
            disabled
          />
        </div>
        <div class="destination-block-target">Highweb / #malina</div>
      </div>
      <v-toggle
        class="task-creator-create-task"
        mode="feather"
        :text="$t('Create task')"
        text-size="10px"
        icon="corner-down-left"
        @click="createTask"
        background
      />
      <v-toggle
        class="task-creator-all"
        icon="cheveron-down"
        :text="$t('Editor')"
        @click="showAllFields"
      />
    </div>
  </div>
</template>

<script>
import VToggle from "../../atoms/VToggle";
import { mapGetters } from "vuex";
import {
  INSPECTOR_SET_STATE,
  INSPECTOR_SET_TOOL,
  TASK_CREATE_TASK
} from "../../services/store/mutation-types";
import FormGroup from "../FormGroup";
import VInputClear from "../VInput/VInputClear";
import VModal from "../VModal";
import VInputBordered from "../VInput/VInputBordered";
import VButtonPrimary from "../VButton/VButtonPrimary";
import VButtonInline from "../VButton/VButtonInline";
import VTextareaClear from "../VTextareaClear";
import { INSPECTOR_STATE_INSPECTING } from "../../services/store/InspectorsStoreModule";
import VToggleSelector from "../VToggleSelector";
import ContentWithSidebar from "../../layouts/ContentWithSidebar";
export default {
  name: "TaskCreator",
  components: {
    ContentWithSidebar,
    VToggleSelector,
    VTextareaClear,
    VButtonInline,
    VButtonPrimary,
    VInputBordered,
    VModal,
    VInputClear,
    FormGroup,
    VToggle
  },
  created() {
    this.$store.subscribe(mutation => {
      if (
        mutation.type === INSPECTOR_SET_STATE &&
        mutation.payload === INSPECTOR_STATE_INSPECTING
      ) {
        this.clearTask();
      }
    });
  },
  data: () => ({
    iconSize: "20px",
    currentForm: {},
    toolParams: {
      stroke: "#fff",
      iconSize: "24px"
    },
    allFieldsModalOpen: false
  }),
  computed: {
    ...mapGetters(["taskCreatorState", "currentPage", "currentProject"]),
    currentFormFilled() {
      return this.currentForm && Object.keys(this.currentForm).length;
    },
    currentFormName() {
      return this.currentFormFilled ? this.currentForm.name : "";
    },
    currentFormText() {
      return this.currentFormFilled ? this.currentForm.text : "";
    }
  },
  methods: {
    toggleTool(state) {
      this.$store.dispatch(INSPECTOR_SET_TOOL, state);
    },
    createTask() {
      if (
        (!this.allFieldsModalOpen && !this.currentProject) ||
        !this.currentProject.id
      ) {
        this.showAllFields();
        return;
      }

      const fields = this.$refs.operationalModal.showModal
        ? this.$refs.allFieldsForm.getFormFields()
        : this.$refs.quickCreateForm.getFormFields();
      this.$store.dispatch(TASK_CREATE_TASK, {
        id: this.currentPage.id,
        ...fields
      });
      this.clearTask();
    },
    clearTask() {
      this.closeAllFieldsModal();
      this.currentForm = {};
      this.$refs.allFieldsForm && this.$refs.allFieldsForm.clearFormGroup();
      this.$refs.quickCreateForm && this.$refs.quickCreateForm.clearFormGroup();
    },
    cancelCreating() {
      this.$store.dispatch(INSPECTOR_SET_STATE, INSPECTOR_STATE_INSPECTING);
    },
    showAllFields() {
      this.$refs.operationalModal.showModal = true;
      this.allFieldsModalOpen = true;
    },
    closeAllFieldsModal() {
      this.$refs.operationalModal.showModal = false;
    },
    updateCurrentForm() {
      this.currentForm = this.$refs.operationalModal.showModal
        ? this.$refs.quickCreateForm &&
          this.$refs.quickCreateForm.getFormFields()
        : this.$refs.allFieldsForm && this.$refs.allFieldsForm.getFormFields();

      if (!this.$refs.operationalModal.showModal) {
        document.getElementById("pp-task-creator-input").focus();
      }
    },
    onChangeName() {
      if (!Object.keys(this.$refs.quickCreateForm.allItems).length) {
        return;
      }
      for (item in this.$refs.quickCreateForm.allItems) {
        this.currentForm[item] = this.$refs.quickCreateForm.allItems[item];
      }
    }
  }
};
</script>

<style lang="scss">
.task-creator {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  &-close.v-toggle {
    position: absolute;
    left: 0;
  }
  &-input {
    .input input {
      border: 0 !important;
      font-size: 18px;
    }
  }
  &-caption {
    position: absolute;
    right: 100%;
    width: 200%;
    text-align: right;
    padding-right: 20px;
    font-size: 14px;
    color: $color-b4;
    font-weight: 100;
  }
  &-tools {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    margin-right: 25px;
    margin-left: -25px;
    .v-toggle {
      opacity: 0.8;
      &.active {
        opacity: 1;
      }
    }
  }
  &-create-task.v-toggle {
    width: 62px;
    height: 34px;
    border-radius: 4px;
  }
  &-modal {
    .pp-modal-container {
      min-width: 700px;
    }
    .pp-modal-content .v-button-primary {
      margin: 0;
    }
    &-buttons {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
  .task-creator-block {
    display: flex;
    width: 30%;
    .task-form {
      width: calc(100% - 120px);
      margin: 0;
    }
  }

  .task-form-more {
    position: absolute;
    background-color: $color-bg2;
  }

  &-destination {
    display: flex;
    & > .v-toggle.chevron {
      padding: 0 5px;
      opacity: 0.6;
    }
  }

  .destination-block {
    max-width: 200px;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    overflow: hidden;
    & > * {
      height: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &-name {
      width: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      font-size: 9px;
      font-weight: 500;
      color: $color-b4;
      .v-toggle {
        padding-left: 10px;
        .icon + .text-block .text {
          margin-left: 2px;
        }
      }
    }
    &-target {
      width: 100%;
      overflow: hidden;
      font-size: 10px;
      margin-top: 5px;
      color: #fff;
    }
    &:hover {
      cursor: pointer;
      .destination-block-target {
        text-decoration: underline;
      }
    }
  }
}
</style>
