<template>
  <div
    class="modal"
    style="display: none"
    v-show="showModal"
    :class="{ show: showModal }"
  >
    <div class="modal-overlay" @click="showModal = false"></div>
    <div class="modal-container">
      <div class="modal-close" @click="showModal = false"></div>
      <div class="modal-header">
        <div class="modal-title">{{ title }}</div>
      </div>
      <div class="modal-content" v-if="showModal">
        <slot style="display: none" v-show="showModal"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { addClass, removeClass } from "../utils";

export default {
  name: "VModal",
  data: () => ({
    showModal: false
  }),
  props: {
    title: String
  },
  watch: {
    showModal(value) {
      if (value) {
        addClass(document.body, "popup-open");
        this.$emit("open");
      } else {
        removeClass(document.body, "popup-open");
        this.$emit("close");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.modal {
  position: absolute;
  &-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  &-container {
    position: fixed;
    background-color: #fff;
    padding: 30px;
    min-width: 350px;
    min-height: 350px;
    max-width: 500px;
    max-height: 70vh;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    overflow-y: auto;
    box-sizing: border-box;
    z-index: 9999;
    text-align: left;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-title {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.25;
    color: #000;
    box-sizing: border-box;
  }

  &-close {
    position: absolute;
    background: transparent;
    border: 0;
    right: 0;
    top: 0;
    cursor: pointer;
    padding: 20px;
    &:before {
      content: "\2715";
    }
  }

  &-content {
    margin-top: 2rem;
    margin-bottom: 2rem;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.8);
  }

  &-content {
    margin-top: 2rem;
    margin-bottom: 2rem;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.8);
  }

  &-btn {
    font-size: 0.875rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background-color: #e6e6e6;
    color: rgba(0, 0, 0, 0.8);
    border-radius: 0.25rem;
    border-style: none;
    border-width: 0;
    cursor: pointer;
    -webkit-appearance: button;
    text-transform: none;
    overflow: visible;
    line-height: 1.15;
    margin: 0;
    will-change: transform;
    -moz-osx-font-smoothing: grayscale;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    transition: -webkit-transform 0.25s ease-out;
    transition: transform 0.25s ease-out;
    transition: transform 0.25s ease-out, -webkit-transform 0.25s ease-out;
    &:focus,
    &:hover {
      -webkit-transform: scale(1.05);
      transform: scale(1.05);
    }
  }
  &-btn-primary {
    background-color: #00449e;
    color: #fff;
  }

  .modal-overlay,
  .modal-content {
    will-change: transform;
  }
  &.show {
    .modal-overlay {
      animation: mmfadeIn 0.3s cubic-bezier(0, 0, 0.2, 1);
    }
    .modal-content {
      animation: mmslideIn 0.3s cubic-bezier(0, 0, 0.2, 1);
    }
  }
  &:not(.show) {
    .modal-overlay {
      animation: mmfadeOut 0.3s cubic-bezier(0, 0, 0.2, 1);
    }
    .modal-content {
      animation: mmslideOut 0.3s cubic-bezier(0, 0, 0.2, 1);
    }
  }
}

@keyframes mmfadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes mmfadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes mmslideIn {
  from {
    transform: translateY(15%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes mmslideOut {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10%);
  }
}
</style>
