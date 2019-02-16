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
    description: String,
    placeholder: String,
    validationRule: String,
    validationMessage: String,
    mask: String,
    maskPattern: String
  },
  computed: {
    changed() {
      if (!this.inputValue && !this.value) {
        return;
      }
      return (
        this.inputValue !== this.value &&
        this.inputValue.toString() !== this.value.toString()
      );
    }
  },
  methods: {
    resetValue() {
      this.value ? (this.inputValue = this.value) : (this.inputValue = "");
    }
  }
};
</script>

<style lang="scss">
input {
  line-height: 1;
}
</style>
