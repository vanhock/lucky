<script>
export default {
  mounted() {
    /** Set value from prop **/
    this.resetValue();
  },
  beforeRouteUpdate(from, to, next) {
    this.resetValue();
    next(true);
  },
  data: () => ({
    inputValue: ""
  }),
  props: {
    name: {
      type: String,
      required: true
    },
    id: String,
    label: {
      type: String
    },
    type: {
      type: String,
      default: "text"
    },
    value: {
      type: [String, Number],
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: Boolean,
    description: String,
    placeholder: String,
    validationRule: String,
    validationMessage: String,
    mask: String,
    maskPattern: String
  },
  computed: {
    changed() {
      if (!this.inputValue) {
        return;
      }
      return (
        this.inputValue !== this.value &&
        this.inputValue.toString() !== this.value.toString()
      );
    }
  },
  watch: {
    $listeners: {
      handler(newListeners, oldListeners = {}) {
        this.$nextTick(() => {
          Object.entries(oldListeners).forEach(([event, fn]) => {
            if (oldListeners[event] === newListeners[event]) {
              return;
            }
            this.$emit(event, fn);
          });
          Object.entries(newListeners).forEach(([event, fn]) => {
            if (oldListeners[event] === newListeners[event]) {
              return;
            }
            this.$off(event, fn);
          });
        });
      },
      immediate: true
    },
    value(newValue) {
      this.inputValue = newValue;
    }
  },
  methods: {
    resetValue() {
      this.value ? (this.inputValue = this.value) : (this.inputValue = "");
    },
    clearValue() {
      this.value = "";
      this.inputValue = "";
    }
  }
};
</script>

<style lang="scss">
input {
  line-height: 1;
}
</style>
