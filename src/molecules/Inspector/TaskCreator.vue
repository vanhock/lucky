<template>
  <div :class="$style['task-creator']">
    <template
      v-if="taskCreatorState !== 'INSPECTOR_CREATOR_STATE_SETTING_TASK'"
    >
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
    </template>
    <div
      :class="$style['task-creation-block']"
      v-if="taskCreatorState === 'INSPECTOR_CREATOR_STATE_SETTING_TASK'"
    >
      <form-group ref="taskForm" :class="$style['task-form']" editable-mode>
        <v-input-clear
          theme="dark"
          name="name"
          :placeholder="$t('Task name here')"
        />
        <template v-if="showMoreFields"></template>
      </form-group>
      <!--<v-toggle :text="$t('Show more')" />-->
      <v-toggle :text="$t('Save task')" background />
    </div>
    <v-toggle :text="$t('Cancel')" @click="cancelCreating" />
  </div>
</template>

<script>
import VToggle from "../../atoms/VToggle";
import { mapGetters } from "vuex";
import {
  INSPECTOR_SET_STATE,
  INSPECTOR_SET_TASK_CREATOR_STATE,
  TASK_CREATE_TASK
} from "../../services/store/mutation-types";
import FormGroup from "../FormGroup";
import VInputClear from "../VInput/VInputClear";
import {
  INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT,
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
    ...mapGetters(["taskCreatorState"])
  },
  methods: {
    toggleTool(state) {
      this.$store.dispatch(INSPECTOR_SET_TASK_CREATOR_STATE, state);
    },
    createTask() {
      const fields = this.$refs.taskCreate.changedItems;
      if (this.$refs.taskCreate.valid) {
        this.$store.dispatch(TASK_CREATE_TASK, fields);
      }
    },
    cancelCreating() {
      this.$store.dispatch(INSPECTOR_SET_STATE, INSPECTOR_STATE_INSPECTING);
      this.$store.dispatch(
        INSPECTOR_SET_TASK_CREATOR_STATE,
        INSPECTOR_CREATOR_STATE_SELECTING_ELEMENT
      );
    }
  }
};
</script>

<style lang="scss" module>
.task-creator {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.task-creation-block {
  display: flex;
  .task-form {
  }
}
</style>
