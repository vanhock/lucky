<template>
  <div class="v-card">
    <div class="v-card-content">
      <div class="v-card-image-container" v-if="image">
        <img class="image" :src="image" :alt="name" />
      </div>
      <div class="v-card-text-container" @click="$emit('click')">
        <div class="name">{{ name }}</div>
        <div class="text">{{ text | truncate(70) }}</div>
        <div class="caption">{{ caption }}</div>
      </div>
    </div>
    <div class="v-card-menu">
      <panel-control class="" dropdown>
        <v-toggle icon="navigation-more" icon-size="25px" />
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
  props: {
    name: {
      type: String,
      required: true
    },
    image: String,
    caption: String,
    text: String
  }
};
</script>

<style lang="scss" scoped>
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
    &:hover {
      background-color: $color-base;
      @include box-shadow(deep);
    }
    &:active {
      top: 1px;
    }
  }
  &-image-container {
    position: relative;
    display: flex;
    height: 250px;
    img {
      width: auto;
    }
  }
  &-text-container {
    display: flex;
    flex-direction: column;
    padding: 20px 20px 0;
    height: 190px;
    box-sizing: border-box;
    margin-top: auto;
    & > * {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
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
      margin: auto 0 17px;
      padding-right: 40px;
      font-weight: 600;
      color: $color-b4;
      font-size: 9px;
    }
    .text {
      max-height: 90px;
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
<style lang="scss">
.v-card {
  .v-card-menu {
    .panel-control {
      .panel-control-content {
        & > .toggle {
          position: absolute;
          display: block;
          z-index: 12;
          top: 0;
          right: 0;
          padding: 5px;
          height: 34px;
          width: 40px;
          .icon {
            fill: $color-b4;
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
              .toggle {
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
}
</style>
