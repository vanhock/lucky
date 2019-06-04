<template>
  <div class="task-creator">
    <v-toggle
      class="task-creator-close"
      icon="cheveron-outline-left"
      :text="$t('Back')"
      @click="cancelCreating"
      v-hotkey.prevent="{ esc: cancelCreating }"
    ></v-toggle>
    <div class="task-creator-tools">
      <v-toggle-selector>
        <v-toggle
          icon="arrow-down-left"
          mode="feather"
          :params="toolParams"
          icon-size="24px"
        />
        <v-toggle
          icon="square"
          mode="feather"
          :params="toolParams"
          icon-size="24px"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="toolParams"
          icon-size="24px"
        />
        <v-toggle
          icon="edit-3"
          mode="feather"
          :params="toolParams"
          icon-size="24px"
        />
      </v-toggle-selector>
      <v-toggle icon="text-box" icon-size="20px" />
      <v-toggle-selector>
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#FF0000' }"
          icon-size="24px"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#fffb25' }"
          icon-size="24px"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#3714ff' }"
          icon-size="24px"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#2ed609' }"
          icon-size="24px"
        />
        <v-toggle
          icon="circle"
          mode="feather"
          :params="{ stroke: '#fff', fill: '#000' }"
          icon-size="24px"
        />
      </v-toggle-selector>
    </div>
    <div class="task-creator-block">
      <v-toggle
        class="task-creator-all"
        icon="cheveron-down"
        :text="$t('More')"
        @click="showAllFields"
      />
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
        :title="$t('Share')"
        @open="updateCurrentForm"
        @close="updateCurrentForm"
      >
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
        <div class="task-creator-modal-buttons">
          <v-button-inline @click="closeAllFieldsModal">{{
            $t("Back")
          }}</v-button-inline>
          <v-button-primary @click="createTask">{{
            $t("Save task")
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
            :params="{ stroke: '#d0d0d0', color: '#d0d0d0' }"
            icon-size="14px"
            text-size="9px"
            disabled
          />
        </div>
        <div class="destination-block-target">Highweb / #malina</div>
      </div>
      <v-toggle
        class="task-creator-create-task"
        :text="$t('Share')"
        @click="createTask"
        background
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
export default {
  name: "TaskCreator",
  components: {
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
      stroke: "#fff"
    }
  }),
  computed: {
    ...mapGetters(["taskCreatorState", "currentPage"]),
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
      this.currentForm = this.$refs.quickCreateForm.allItems;
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
    width: 80px;
    height: 34px;
    border-radius: 4px;
  }
  &-modal {
    .pp-modal-container {
      min-width: 500px;
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
