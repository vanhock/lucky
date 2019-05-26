<template>
  <div class="task-creator">
    <div
      class="task-creator-tools"
      v-if="taskCreatorState !== 'INSPECTOR_CREATOR_STATE_SETTING_TASK'"
    >
      <div class="task-creator-caption">
        {{ currentToolCaption }}
      </div>
      <v-toggle
        icon="target"
        :icon-size="iconSize"
        :active="
          taskCreatorState === 'INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT'
        "
        @click="toggleTool('INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT')"
      />
      <v-toggle
        icon="text-box"
        :icon-size="iconSize"
        :active="taskCreatorState === 'INSPECTOR_CREATOR_STATE_SELECTING_AREA'"
        @click="toggleTool('INSPECTOR_CREATOR_STATE_SELECTING_AREA')"
      />
    </div>
    <div
      class="task-creator-block"
      v-if="taskCreatorState === 'INSPECTOR_CREATOR_STATE_SETTING_TASK'"
    >
      <v-toggle
        class="task-creator-all"
        icon="cheveron-down"
        :text="$t('More')"
        @click="showAllFields"
      />
      <form-group ref="quickCreateForm" class="task-form" editable-mode>
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
        :title="$t('Create task')"
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
      <v-toggle
        class="task-creator-create-task"
        :text="$t('Save task')"
        @click="createTask"
        background
      />
    </div>
    <v-toggle :text="$t('Cancel')" @click="cancelCreating" />
  </div>
</template>

<script>
import VToggle from "../../atoms/VToggle";
import { mapGetters } from "vuex";
import {
  INSPECTOR_SET_STATE,
  INSPECTOR_SET_TARGET_ELEMENT,
  INSPECTOR_SET_TASK_CREATOR_STATE,
  TASK_CREATE_TASK
} from "../../services/store/mutation-types";
import FormGroup from "../FormGroup";
import VInputClear from "../VInput/VInputClear";
import {
  INSPECTOR_CREATOR_STATE_SELECTING_AREA,
  INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT,
  INSPECTOR_STATE_INSPECTING
} from "../../services/store/InspectorsStoreModule";
import VModal from "../VModal";
import VInputBordered from "../VInput/VInputBordered";
import VButtonPrimary from "../VButton/VButtonPrimary";
import VButtonInline from "../VButton/VButtonInline";
import VTextareaClear from "../VTextareaClear";
export default {
  name: "TaskCreator",
  components: {
    VTextareaClear,
    VButtonInline,
    VButtonPrimary,
    VInputBordered,
    VModal,
    VInputClear,
    FormGroup,
    VToggle
  },
  data: () => ({
    iconSize: "20px",
    currentForm: {}
  }),
  computed: {
    ...mapGetters(["taskCreatorState", "currentPage"]),
    currentToolCaption() {
      if (this.taskCreatorState === INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT) {
        return this.$t("Select element on the page");
      } else if (
        this.taskCreatorState === INSPECTOR_CREATOR_STATE_SELECTING_AREA
      ) {
        return this.$t("Highlight target area");
      }
    },
    currentFormFilled() {
      return this.currentForm && Object.keys(this.currentForm);
    },
    currentFormName() {
      return this.currentFormFilled && this.currentForm.name;
    },
    currentFormText() {
      return this.currentFormFilled && this.currentForm.text;
    }
  },
  methods: {
    toggleTool(state) {
      this.$store.dispatch(INSPECTOR_SET_TASK_CREATOR_STATE, state);
    },
    createTask() {
      const fields = this.$refs.operationalModal.showModal
        ? this.$refs.allFieldsForm.getFormFields()
        : this.$refs.quickCreateForm.getFormFields();
      this.$store.dispatch(TASK_CREATE_TASK, {
        id: this.currentPage.id,
        ...fields
      });
      this.$store.dispatch(
        INSPECTOR_SET_TASK_CREATOR_STATE,
        INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT
      );
      this.closeAllFieldsModal();
      this.$refs.allFieldsForm.clearFormGroup();
      this.$refs.quickCreateForm.clearFormGroup();
    },
    cancelCreating() {
      this.$store.dispatch(INSPECTOR_SET_STATE, INSPECTOR_STATE_INSPECTING);
      this.$store.dispatch(
        INSPECTOR_SET_TASK_CREATOR_STATE,
        INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT
      );
      this.$store.dispatch(INSPECTOR_SET_TARGET_ELEMENT, {});
      this.closeAllFieldsModal();
      this.$refs.allFieldsForm && this.$refs.allFieldsForm.clearFormGroup();
      this.$refs.quickCreateForm && this.$refs.quickCreateForm.clearFormGroup();
    },
    showAllFields() {
      this.$refs.operationalModal.showModal = true;
    },
    closeAllFieldsModal() {
      this.$refs.operationalModal.showModal = false;
    },
    updateCurrentForm() {
      this.currentForm = this.$refs.operationalModal.showModal
        ? this.$refs.quickCreateForm.getFormFields()
        : this.$refs.allFieldsForm.getFormFields();

      if (!this.$refs.operationalModal.showModal) {
        document.getElementById("pp-task-creator-input").focus();
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
  }
  &-create-task {
    width: 120px;
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
}

.task-creator-block {
  display: flex;
  width: 53%;
  .task-form {
    width: calc(100% - 120px);
  }
}

.task-form-more {
  position: absolute;
  background-color: $color-bg2;
}
</style>
