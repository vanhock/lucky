<template>
  <div class="trash-view">
    <template v-if="trashLength">
      <v-button-primary @click="openModal('create')">{{
        $t("Empty trash")
      }}</v-button-primary>
      <trash-list
        :trash="tasksTrash"
        :title="$t('Tasks')"
        @restore="restore('task', $event)"
        @delete="openModal('deleteTask', { target: 'task', ...$event })"
      />
      <trash-list
        :trash="pagesTrash"
        :title="$t('pages')"
        @restore="restore('page', $event)"
        @delete="openModal('deletePage', { target: 'page', ...$event })"
      />
      <trash-list
        :trash="projectsTrash"
        :title="$t('projects')"
        @restore="restore('project', $event)"
        @delete="openModal('deleteProject', { target: 'project', ...$event })"
      />

      <v-modal
        ref="operationalModal"
        class="operational-modal"
        :title="currentModalTitle"
        :description="currentModalDescription"
      >
        <v-button-primary @click="currentAction">{{
          currentModalButtonName
        }}</v-button-primary>
      </v-modal>
    </template>
    <template v-if="!trashLength">
      <empty-placeholder title="Trash is empty" icon="garbage" />
    </template>
  </div>
</template>

<i18n>
  {
    "en": {
      "Empty trash": "Empty trash",
      "Restore": "Restore",
      "Delete forever": "Delete forever",
      "Empty all in trash": "Empty all in trash",
      "All documents in trash will be deleted permanently!": "All documents in trash will be deleted permanently!",
      "Delete project": "Delete project",
      "Delete page": "Delete page",
      "The Project will be deleted permanently!": "The Project will be deleted permanently!",
      "The Page will be deleted permanently!": "The Page will be deleted permanently!"
    },
    "ru": {
      "Empty trash": "Очистить корзину",
      "Restore": "Восстановить",
      "Delete forever": "Удалить навсегда",
      "Empty all in trash": "Удалить все содержимое корзины",
      "All documents in trash will be deleted permanently!": "Все документы в корзине удалятся без возможности восстановления!",
      "Delete project": "Удалить проект",
      "Delete page": "Удалить страницу",
      "The Project will be deleted permanently!": "Проект будет удален без возможности восстановления!",
      "The Page will be deleted permanently!": "Страница будет удалена без возможности восстановления!"
    }
  }
</i18n>

<script>
import ModalMixin from "../mixins/ModalMixin.js";
import VButtonPrimary from "../molecules/VButton/VButtonPrimary";
import {
  TRASH_GET_PAGES_TRASH,
  TRASH_GET_PROJECTS_TRASH,
  TRASH_GET_TASKS_TRASH
} from "../services/store/mutation-types";
import { notification } from "../services/notification";
import TrashList from "../organisms/TrashList";
import { mapGetters } from "vuex";
import VModal from "../molecules/VModal";
import EmptyPlaceholder from "../molecules/EmptyPlaceholder";
export default {
  name: "TrashView",
  mixins: [ModalMixin],
  components: { EmptyPlaceholder, TrashList, VButtonPrimary, VModal },
  created() {
    this.$store.dispatch(TRASH_GET_PROJECTS_TRASH);
    this.$store.dispatch(TRASH_GET_PAGES_TRASH);
    this.$store.dispatch(TRASH_GET_TASKS_TRASH);
    this.modals = {
      deleteAll: {
        title: this.$t("Empty all in trash"),
        description: this.$t(
          "All documents in trash will be deleted permanently!"
        ),
        action: "deleteAll",
        buttonName: this.$t("Empty trash")
      },
      deleteProject: {
        title: this.$t("Delete project"),
        description: this.$t("The Project will be deleted permanently!"),
        action: "delete",
        buttonName: this.$t("Delete project")
      },
      deletePage: {
        title: this.$t("Delete page"),
        description: this.$t("The Page will be deleted permanently!"),
        action: "delete",
        buttonName: this.$t("Delete page")
      },
      deleteTask: {
        title: this.$t("Delete task"),
        description: this.$t("The Task will be deleted permanently!"),
        action: "delete",
        buttonName: this.$t("Delete task")
      }
    };
  },
  data: () => ({
    modals: {},
    selectedModal: "deleteAll"
  }),
  computed: {
    ...mapGetters(["projectsTrash", "pagesTrash", "tasksTrash"]),
    trashLength() {
      return this.projectsTrash.length;
    }
  },
  methods: {
    restore(target, payload) {
      this.$store
        .dispatch(`TRASH_RESTORE_${target.toUpperCase()}`, payload)
        .then(() => {
          notification(this, "success", `${target} restored`);
        })
        .catch(error => {
          notification(this, "error", error);
        });
    },
    delete() {
      const target = this.dataForOperations.target;
      this.$store
        .dispatch(`TRASH_DELETE_${target.toUpperCase()}`, {
          id: this.dataForOperations.id
        })
        .then(() => {
          notification(this, "success", `${target} deleted permanently`);
          this.$refs.operationalModal.showModal = false;
        })
        .catch(error => {
          notification(this, "error", error);
          this.$refs.operationalModal.showModal = false;
        });
    }
  }
};
</script>

<style scoped></style>
