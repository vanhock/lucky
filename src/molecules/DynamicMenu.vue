<template>
  <div class="dynamic-menu">
    <v-menu :align="align">
      <menu-item
        v-for="(item, index) in items"
        :key="index"
        :class="{ 'has-submenu': item.children, bottom: item.bottom }"
      >
        <router-link
          class="router-link"
          tag="div"
          :to="item.to"
          :disabled="item.disabled"
        >
          <v-toggle
            :icon="item.icon"
            :text="item.text"
            :show-text="showText"
            :label="item.label"
            icon-size="23px"
            text-size="14px"
          />
        </router-link>
        <v-menu class="submenu" v-if="item.children">
          <menu-item
            v-for="(child, index) in $store.getters[item.children]"
            :key="index"
          >
            <router-link
              class="router-link"
              tag="div"
              :to="`/${child.id}/pages`"
              :disabled="child.disabled"
            >
              <v-toggle :text="child.name" :show-text="showText" />
            </router-link>
          </menu-item>
        </v-menu>
      </menu-item>
    </v-menu>
  </div>
</template>

<script>
import VMenu from "../atoms/VMenu";
import MenuItem from "../atoms/MenuItem";
import VToggle from "../atoms/VToggle";
export default {
  name: "DynamicMenu",
  components: { VToggle, VMenu, MenuItem },
  props: {
    items: {
      type: Array,
      default: () => [],
      required: true
    },
    showText: Boolean,
    align: {
      type: String,
      default: "horizontal"
    }
  }
};
</script>
