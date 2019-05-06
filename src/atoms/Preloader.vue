<template>
  <div class="preloader">
    <slot></slot>
    <div
      class="preloader-container"
      :class="{ show: showPreloader || show, dark: dark }"
    >
      <div class="pp-fading-spinner">
        <div
          class="pp-circle"
          :class="'pp-circle' + (i + 1)"
          v-for="i in 12"
          :key="i"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Preloader",
  data: () => ({
    timer: 10000,
    showPreloader: false
  }),
  mounted() {
    const self = this;
    this.$router.beforeEach((from, to, next) => {
      self.showPreloader = true;
      next();
    });
    this.$router.afterEach((from, to, next) => {
      setTimeout(() => {
        self.showPreloader = false;
      }, 500);
    });
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    preloaderOutOfTime: () => {
      if (!this || !this.show) {
        return false;
      }
      const self = this;
      setTimeout(() => {
        self.preloaderOutOfTime = true;
      }, this.timer);
    }
  }
};
</script>

<style lang="scss" scoped>
.preloader {
  &-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: $color-b5;
    opacity: 0;
    z-index: -5;
    transition: opacity 0.1s ease-in-out;
    &.show {
      opacity: 1;
      z-index: 9999;
      transition: opacity 0.1s ease-in-out;
    }

    &.dark {
      background-color: $color-bg1;
      .pp-fading-spinner {
        .pp-circle {
          &:before {
            background-color: #fff;
          }
        }
      }
    }
  }
}

.pp-fading-spinner {
  position: absolute;
  @include align();
  width: 40px;
  height: 40px;

  .pp-circle {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    &:before {
      content: "";
      display: block;
      margin: 0 auto;
      width: 4%;
      height: 24%;
      background-color: #333;
      border-radius: 100%;
      -webkit-animation: pp-circleFadeDelay 1.2s infinite ease-in-out both;
      animation: pp-circleFadeDelay 1.2s infinite ease-in-out both;
    }
  }
}

.pp-fading-spinner .pp-circle2 {
  -webkit-transform: rotate(30deg);
  -ms-transform: rotate(30deg);
  transform: rotate(30deg);
}
.pp-fading-spinner .pp-circle3 {
  -webkit-transform: rotate(60deg);
  -ms-transform: rotate(60deg);
  transform: rotate(60deg);
}
.pp-fading-spinner .pp-circle4 {
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}
.pp-fading-spinner .pp-circle5 {
  -webkit-transform: rotate(120deg);
  -ms-transform: rotate(120deg);
  transform: rotate(120deg);
}
.pp-fading-spinner .pp-circle6 {
  -webkit-transform: rotate(150deg);
  -ms-transform: rotate(150deg);
  transform: rotate(150deg);
}
.pp-fading-spinner .pp-circle7 {
  -webkit-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}
.pp-fading-spinner .pp-circle8 {
  -webkit-transform: rotate(210deg);
  -ms-transform: rotate(210deg);
  transform: rotate(210deg);
}
.pp-fading-spinner .pp-circle9 {
  -webkit-transform: rotate(240deg);
  -ms-transform: rotate(240deg);
  transform: rotate(240deg);
}
.pp-fading-spinner .pp-circle10 {
  -webkit-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  transform: rotate(270deg);
}
.pp-fading-spinner .pp-circle11 {
  -webkit-transform: rotate(300deg);
  -ms-transform: rotate(300deg);
  transform: rotate(300deg);
}
.pp-fading-spinner .pp-circle12 {
  -webkit-transform: rotate(330deg);
  -ms-transform: rotate(330deg);
  transform: rotate(330deg);
}
.pp-fading-spinner .pp-circle2:before {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}
.pp-fading-spinner .pp-circle3:before {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
}
.pp-fading-spinner .pp-circle4:before {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}
.pp-fading-spinner .pp-circle5:before {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}
.pp-fading-spinner .pp-circle6:before {
  -webkit-animation-delay: -0.7s;
  animation-delay: -0.7s;
}
.pp-fading-spinner .pp-circle7:before {
  -webkit-animation-delay: -0.6s;
  animation-delay: -0.6s;
}
.pp-fading-spinner .pp-circle8:before {
  -webkit-animation-delay: -0.5s;
  animation-delay: -0.5s;
}
.pp-fading-spinner .pp-circle9:before {
  -webkit-animation-delay: -0.4s;
  animation-delay: -0.4s;
}
.pp-fading-spinner .pp-circle10:before {
  -webkit-animation-delay: -0.3s;
  animation-delay: -0.3s;
}
.pp-fading-spinner .pp-circle11:before {
  -webkit-animation-delay: -0.2s;
  animation-delay: -0.2s;
}
.pp-fading-spinner .pp-circle12:before {
  -webkit-animation-delay: -0.1s;
  animation-delay: -0.1s;
}

@-webkit-keyframes pp-circleFadeDelay {
  0%,
  39%,
  100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}

@keyframes pp-circleFadeDelay {
  0%,
  39%,
  100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}
</style>
