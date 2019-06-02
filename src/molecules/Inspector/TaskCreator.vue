<template>
  <div class="task-creator">
    <v-toggle
      class="task-creator-close"
      icon="cheveron-outline-left"
      :text="$t('Back')"
      @click="cancelCreating"
    ></v-toggle>
    <div class="task-creator-tools">
      <v-toggle-selector>
        <v-toggle icon="arrow-down-left" mode="feather" :params="toolParams" />
        <v-toggle icon="square" mode="feather" :params="toolParams" />
        <v-toggle icon="circle" mode="feather" :params="toolParams" />
        <v-toggle icon="edit-3" mode="feather" :params="toolParams" />
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
      this.clearTask();
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
  &-close {
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
    width: 65px;
  }
  &-create-task {
    width: 80px;
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
  width: 40%;
  margin: 0 auto;
  .task-form {
    width: calc(100% - 120px);
    margin: 0;
  }
}

.task-form-more {
  position: absolute;
  background-color: $color-bg2;
}
</style>
