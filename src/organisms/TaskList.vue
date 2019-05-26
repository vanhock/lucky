<template>
  <div class="tasks" ref="tasksList">
    <ul class="tasks-list" v-if="tasks && tasks.length">
      <v-card-clear
        ref="taskItem"
        v-for="(task, index) in tasks"
        :key="task.id"
        :name="task.name"
        :text="task.text"
        :caption="normalizeDate(task.updatedAt)"
        :selecting-mode="tasksSelected"
        @select="handleTaskSelected"
        show-menu
      >
        <template v-slot:menu>
          <v-menu>
            <menu-item
              ><v-toggle
                icon="checkmark"
                icon-size="14px"
                :text="$t('Select')"
                @click="setSelected(index)"
            /></menu-item>
            <menu-item
              ><v-toggle
                icon="edit-pencil"
                icon-size="14px"
                :text="$t('Edit task')"
                @click="openEditModal(task)"
            /></menu-item>
            <menu-item
              ><v-toggle
                icon="trash"
                icon-size="14px"
                :text="$t('Move to trash')"
                @click="moveTaskToTrash(task)"
            /></menu-item>
          </v-menu>
        </template>
      </v-card-clear>
    </ul>
    <empty-placeholder
      v-if="!tasks || !tasks.length"
      icon="task-list"
      :title="$t('No tasks yet')"
      transparent
    />
    <v-modal ref="editModal" class="task-edit-modal" :title="$t('Edit task')">
      <form-group ref="editForm" editable-mode>
        <v-input-bordered
          name="name"
          ref="createInputName"
          :value="editFormName"
          :label="$t('Task name')"
        />
        <v-textarea-clear
          name="text"
          :value="editFormText"
          :label="$t('Task description')"
        />
      </form-group>
      <div class="task-creator-modal-buttons">
        <v-button-inline @click="$refs.editModal.showModal = false">{{
          $t("Back")
        }}</v-button-inline>
        <v-button-primary @click="editTask">{{ $t("Save") }}</v-button-primary>
      </div>
    </v-modal>
  </div>
</template>

<script>
import { normalizeDate, scrollTo } from "../utils";
import { mapGetters } from "vuex";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
import VCardClear from "../molecules/VCard/VCardClear";
import VMenu from "../atoms/VMenu";
import MenuItem from "../atoms/MenuItem";
import VToggle from "../atoms/VToggle";
import {
  INSPECTOR_SET_TASK_CREATOR_FORM,
  TASK_EDIT_TASK,
  TASK_MOVE_TO_TRASH
} from "../services/store/mutation-types";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import VButtonInline from "../molecules/VButton/VButtonInline";
import FormGroup from "../molecules/FormGroup";
import VInputBordered from "../molecules/VInput/VInputBordered";
import VTextareaClear from "../molecules/VTextareaClear";
import VModal from "../molecules/VModal";
export default {
  name: "TaskList",
  components: {
    VModal,
    VTextareaClear,
    VInputBordered,
    FormGroup,
    VButtonInline,
    VButtonPrimary,
    VToggle,
    MenuItem,
    VMenu,
    VCardClear,
    EmptyPlaceholder
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === INSPECTOR_SET_TASK_CREATOR_FORM) {
        this.currentForm = state.taskCreatorForm;
        this.toggleModal(state.taskCreatorForm.target);
      }
    });
  },
  data: () => ({
    tasksSelected: false,
    noScroll: false,
    editForm: {}
  }),
  props: {
    tasks: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(["targetElement", "taskCreatorForm", "taskCreatorModal"]),
    listElement() {
      return this.$refs.tasksList;
    },
    editFormName() {
      return this.editForm.name;
    },
    editFormText() {
      return this.editForm.text;
    }
  },
  watch: {
    targetElement(value) {
      if (!value) {
        return;
      }
      this.scrollToTask(value.foundNodeIndex);
    }
  },
  methods: {
    INSPECTOR_SET_TARGET_ELEMENT(nodeIndex, designIndex, foundNodeIndex) {
      this.$store.dispatch("INSPECTOR_SET_TARGET_ELEMENT", {
        nodeIndex: parseInt(nodeIndex),
        designIndex: parseInt(designIndex),
        foundNodeIndex: parseInt(foundNodeIndex)
      });
      /** If we set target element from Task List **/
      this.noScroll = true;
    },
    scrollToTask(index) {
      const targetTask = this.listElement.getElementsByTagName("li")[index];
      if (!targetTask) {
        return;
      }
      if (!this.noScroll) {
        scrollTo(this.listElement, targetTask.offsetTop - 100, 100);
      } else {
        this.noScroll = false;
      }
    },
    normalizeDate(date) {
      return normalizeDate(date);
    },
    handleTaskSelected() {
      this.$nextTick(() => {
        let hasSelected = false;
        this.$children.some(child => {
          if (child.$children.length && child.$children[0].selected) {
            return (hasSelected = true);
          }
        });
        this.tasksSelected = hasSelected;
      });
    },
    setSelected(index) {
      this.$children[index + 1].$children[0].selected = true;
      this.tasksSelected = true;
    },
    openEditModal(task) {
      this.editForm = task;
      this.$refs.editModal.showModal = true;
    },
    editTask() {
      this.$store
        .dispatch(TASK_EDIT_TASK, {
          id: this.editForm.id,
          ...this.$refs.editForm.changedItems
        })
        .then(() => {
          this.$refs.editModal.showModal = false;
        });
    },
    moveTaskToTrash(task) {
      this.$store.dispatch(TASK_MOVE_TO_TRASH, task);
    }
  }
};
</script>

<style lang="scss" scoped>
.tasks {
  position: absolute;
  top: 50px;
  right: 0;
  width: 350px;
  height: calc(100% - 50px);
  background-color: $color-b5;
  color: #000;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 10;
  transition: opacity 0.2s ease-in;
  opacity: 1;
  @include box-shadow(medium);
  &:hover {
    opacity: 1;
  }
}
</style>
<style lang="scss">
.tasks {
  .tasks-list {
    margin: 25px 0;
    padding: 0;
    .v-card {
      margin: 10px 15px;
    }
    .v-card-text-container {
      height: 110px;
    }
  }
}
</style>
