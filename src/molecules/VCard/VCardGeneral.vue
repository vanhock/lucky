<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="project-item">
    <v-card
      :name="name"
      :image="image"
      :caption="caption"
      :badge="badge"
      :text="text"
      @click="$emit('click')"
      show-menu
      menu-position="bottom"
    >
      <v-toggle
        icon="user-plus"
        mode="feather"
        :params="{ iconSize: '18px', stroke: '#000' }"
        @click="$emit('invite', item)"
      />

      <template v-slot:menu>
        <v-menu>
          <menu-item>
            <v-toggle
              icon="trash"
              :params="{ iconSize: '14px' }"
              :text="$t('To trash')"
              @click="$emit('delete', item)"
            />
          </menu-item>
          <menu-item>
            <v-toggle
              icon="edit-3"
              mode="feather"
              :text="$t('Edit')"
              :params="{ iconSize: '14px' }"
              @click="$emit('edit', item)"
            />
          </menu-item>
          <menu-item
            ><v-toggle
              icon="checkmark"
              :params="{ iconSize: '14px' }"
              :text="$t('Select')"
              @click="$emit('select', item)"
          /></menu-item>
        </v-menu>
      </template>
    </v-card>
  </div>
</template>

<script>
import VCard from "../../atoms/VCard";
import Zondicon from "vue-zondicons/src/components/Zondicon";
import MenuItem from "../../atoms/MenuItem";
import VToggle from "../../atoms/VToggle";
import VMenu from "../../atoms/VMenu";
export default {
  name: "VCardGeneral",
  components: { VMenu, VToggle, MenuItem, Zondicon, VCard },
  extends: VCard,
  props: {
    item: Object
  }
};
</script>

<style lang="scss">
.project-item {
  .v-card-text-container {
    .name {
      height: 30px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 250px;
    }
  }
  .v-card-actions {
    .v-toggle {
      padding: 12px;
      margin: 0 2px;
      opacity: 0.3;
      &:hover {
        opacity: 0.5;
      }
    }
  }
}
</style>
