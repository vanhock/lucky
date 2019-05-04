<template>
  <div class="trash-list" v-if="trash && trash.length">
    <div class="title">{{ title }}</div>
    <v-card-table
      class="trash-list-item"
      v-for="item in trash"
      :key="item.id"
      :name="item.name"
      :caption="normalizeData(item.updatedAt)"
      :actions="actions"
      @restore="$emit('restore', item)"
      @delete="$emit('delete', item)"
    />
  </div>
</template>

<script>
import { normalizeData } from "../utils";
import VCardTable from "../molecules/VCardTable";
export default {
  name: "TrashList",
  components: { VCardTable },
  data: () => ({
    actions: [
      {
        name: "restore",
        title: "Restore"
      },
      {
        name: "delete",
        title: "Delete forever"
      }
    ]
  }),
  props: {
    trash: {
      type: Array,
      default: () => []
    },
    title: String
  },
  methods: {
    normalizeData(date) {
      return normalizeData(date);
    }
  }
};
</script>

<style lang="scss">
.trash-list {
  .title {
    margin-bottom: 20px;
  }
  &-item {
    &:not(:last-child):not(:nth-child(2)) {
      .v-card-content {
        border-radius: 0;
      }
    }
    &:nth-child(2) {
      .v-card-content {
        border-radius: 7px 7px 0 0;
      }
    }
    &:last-child {
      .v-card-content {
        border-radius: 0 0 7px 7px;
      }
    }
    &:not(:last-child) {
      &:after {
        content: "";
        position: absolute;
        height: 1px;
        width: calc(100% - 40px);
        bottom: 0;
        @include galign();
        background-color: $color-b4;
      }
    }
    .v-card-content {
      cursor: default;
      .caption {
        position: absolute;
        bottom: 18px;
        margin: 0;
        padding: 0;
      }
      &:active {
        top: 0;
      }
    }
  }
}
</style>
