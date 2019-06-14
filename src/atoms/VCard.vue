<template>
  <div class="v-card" :class="{ selected: selected }">
    <div class="v-card-content">
      <div class="v-card-image-container">
        <img class="image" :src="image" v-if="image" :alt="name" />
      </div>
      <div class="v-card-text-container" @click="onclick">
        <div class="name">{{ name }}</div>
        <div class="text">{{ text | truncate(70) }}</div>
        <div class="caption">{{ caption }}</div>
      </div>
    </div>
    <div class="v-card-menu" v-if="showMenu">
      <panel-control v-if="!selectingMode" dropdown>
        <v-toggle icon="navigation-more" :params="{ iconSize: '25px' }" />
        <template v-slot:dropdown>
          <slot name="menu"></slot>
        </template>
      </panel-control>
    </div>

    <div class="v-card-actions"><slot></slot></div>
  </div>
</template>

<script>
import Filters from "../mixins/FiltersMixin";
import VToggle from "./VToggle";
import PanelControl from "./PanelControl";
export default {
  name: "VCard",
  components: { PanelControl, VToggle },
  mixins: [Filters],
  data: () => ({
    selected: false
  }),
  props: {
    name: {
      type: String,
      required: true
    },
    image: String,
    caption: String,
    text: String,
    selectingMode: Boolean,
    showMenu: Boolean
  },
  methods: {
    onclick(e) {
      if (e.ctrlKey || this.selectingMode) {
        this.$emit("select");
        return (this.selected = !this.selected);
      }
      this.$emit("click");
    }
  }
};
</script>

<style lang="scss">
.v-card {
  position: relative;
  &-content {
    position: relative;
    border-radius: 5px;
    @include box-shadow(medium);
    will-change: box-shadow, background-color;
    transition: box-shadow 0.2s ease-out;
    cursor: pointer;
    background-color: #fff;
    border: 2px solid transparent;
    &:hover {
      background-color: $color-base;
      @include box-shadow(deep);
    }
    &:active {
      top: 1px;
    }
  }
  &.selected {
    .v-card-content {
      border-color: $color-w3;
    }
  }
  &-image-container {
    position: relative;
    display: flex;
    height: 250px;
    img {
      width: 100%;
    }
  }
  &-text-container {
    display: flex;
    flex-direction: column;
    padding: 20px 0 0;
    height: 110px;
    width: 100%;
    box-sizing: border-box;
    margin-top: auto;
    position: absolute;
    bottom: 0;
    background-color: rgba(255, 255, 255, 1);
    & > * {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
    .name,
    .text,
    .caption {
      padding-left: 20px;
      padding-right: 20px;
    }
    .name {
      font-weight: bold;
      max-height: 60px;
      overflow: hidden;
      max-width: 90%;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .caption {
      margin: auto 0 0;
      padding-right: 40px;
      font-weight: 600;
      color: $color-b4;
      font-size: 9px;
      background-color: #fff;
      height: 50px;
      display: flex;
      align-items: center;
    }
    .text {
      max-height: 90px;
      min-height: 15px;
      overflow: hidden;
      font-size: 12px;
      font-weight: 500;
      color: $color-b3;
    }
  }
  &-menu {
    position: absolute;
    right: 0;
    top: 0;
    .panel-control {
      .panel-control-content {
        & > .v-toggle {
          position: absolute;
          display: flex;
          z-index: 12;
          top: 0;
          right: 0;
          padding: 5px;
          height: 34px;
          width: 40px;
          .icon {
            fill: $color-b4;
            margin-right: 0;
          }
        }
      }
      .dropdown {
        position: absolute;
        z-index: 11;
        left: auto;
        right: 0;
        top: 0;
        padding-top: 0;
        transform: none;
        &-content {
          position: relative;
          padding: 10px 45px 10px 0;
          border-radius: 7px;
          @include box-shadow(medium);
          &:before {
            display: none;
          }
          .menu {
            &-item {
              padding: 0;
              .v-toggle {
                width: 140px;
                justify-content: flex-start;
                padding: 10px 10px 10px 20px;
                font-size: 11px;
              }
            }
          }
        }
      }
    }
  }
  &-actions {
    position: absolute;
    right: 5px;
    bottom: 0;
    display: flex;
    margin-top: auto;
    margin-left: auto;

    & > * {
      cursor: pointer;
    }
  }
}
</style>
