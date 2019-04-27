<script>
import _ from "lodash";
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
    changed: _.debounce(function() {
      this.$emit("inputChanged", this.inputValue);
      return (
        this.inputValue !== this.value &&
        this.inputValue.toString() !== this.value.toString()
      );
    }, 400)
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
