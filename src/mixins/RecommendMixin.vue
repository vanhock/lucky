<script>
import PSD from "../psd.json";
import { mapGetters } from "vuex";
import { addClass, removeClass } from "../modules/utils";

export default {
  name: "RecommendMixin",
  data: () => ({
    targetLocked: false,
    currentBlock: {},
    gutter: 10
  }),
  created() {
    this.setDesignMarkup();
  },
  mounted() {
    this.testPage();
  },
  computed: {
    ...mapGetters(["designMarkup"])
  },
  methods: {
    setDesignMarkup() {
      this.$store.dispatch("setDesignMarkup", PSD);
    },
    testPage() {
      if (!this.designMarkup || !Object.entries(this.designMarkup).length) {
        return;
      }
      this.jsonRunner(this.designMarkup.children);
    },
    jsonRunner(array) {
      array.forEach(item => {
        if (!this.targetLocked) {
          this.domRunner(null, item);
        }
      });
    },
    domRunner(node, block) {
      const all = document.getElementsByTagName("*");

      for (let i = 0, max = all.length; i < max && !this.targetLocked; i++) {
        if (this.checkParams(all[i], block)) {
          this.targetLocked = true;
          addClass(all[i], "highlight");
          console.log("target locked!");
          break;
        }
      }
    },
    checkParams(node, block) {
      if (!node || !block || !node.clientWidth || !node.clientHeight) {
        return false;
      }
      return (
        Math.abs(block.width - node.clientWidth) <= this.gutter &&
        Math.abs(block.height - node.clientHeight) <= this.gutter
      );
    }
  }
};
</script>

<style lang="scss">
.highlight {
  box-shadow: 0 0 3px 3px #ffff00;
}
</style>
