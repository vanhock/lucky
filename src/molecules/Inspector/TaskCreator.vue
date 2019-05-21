<template>
  <div :class="$style['task-creator']">
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
      :class="$style['task-creator-block']"
      v-if="taskCreatorState === 'INSPECTOR_CREATOR_STATE_SETTING_TASK'"
    >
      <form-group ref="taskForm" :class="$style['task-form']" editable-mode>
        <v-input-clear
          id="pp-task-creator-input"
          class="task-creator-input"
          theme="dark"
          name="name"
          :placeholder="$t('Task name here')"
        />
        <template v-if="showMoreFields"></template>
      </form-group>
      <!--<v-toggle :text="$t('Show more')" />-->
      <v-toggle :text="$t('Save task')" @click="createTask" background />
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
  INSPECTOR_STATE_CREATING,
  INSPECTOR_STATE_INSPECTING
} from "../../services/store/InspectorsStoreModule";
export default {
  name: "TaskCreator",
  components: { VInputClear, FormGroup, VToggle },
  data: () => ({
    iconSize: "20px",
    showMoreFields: false
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
    }
  },
  methods: {
    toggleTool(state) {
      this.$store.dispatch(INSPECTOR_SET_TASK_CREATOR_STATE, state);
    },
    createTask() {
      const fields = this.$refs.taskForm.changedItems;
      this.$store.dispatch(TASK_CREATE_TASK, {
        id: this.currentPage.id,
        ...fields
      });
      this.$store.dispatch(
        INSPECTOR_SET_TASK_CREATOR_STATE,
        INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT
      );
    },
    cancelCreating() {
      this.$store.dispatch(INSPECTOR_SET_STATE, INSPECTOR_STATE_INSPECTING);
      this.$store.dispatch(
        INSPECTOR_SET_TASK_CREATOR_STATE,
        INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT
      );
      this.$store.dispatch(INSPECTOR_SET_TARGET_ELEMENT, {});
    }
  }
};
</script>

<style lang="scss" module>
.task-creator {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.task-creator-block {
  display: flex;
  width: 50%;
  .task-form {
    width: calc(100% - 120px);
  }
}
</style>
<style lang="scss">
.task-creator {
  &-input {
    .input input {
      border: 0 !important;
      font-size: 18px;
    }
  }
  &-caption {
    color: $color-b3;
    font-weight: 100;
    position: absolute;
    right: 100%;
    width: 200%;
    text-align: right;
    padding-right: 20px;
  }
  &-tools {
    position: relative;
    display: flex;
    align-items: center;
  }
}
</style>
