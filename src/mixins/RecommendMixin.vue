<script>
import PSD from "../psd.json";
import { mapGetters } from "vuex";
import { addClass, removeClass } from "../modules/utils";

export default {
  name: "RecommendMixin",
  data: () => ({
    targetLocked: false,
    currentBlock: {},
    searchGutter: 2,
    testGutter: 0,
    foundBlocks: [],
    errors: [],
    text: {
      errorsFound: "Обнаружены ошибки"
    }
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
      this.jsonRunner(this.designMarkup);
    },
    jsonRunner(array) {
      array.forEach(item => {
        this.domRunner(null, item);
      });
    },
    domRunner(node, block) {
      const all = document.getElementsByTagName("*");

      for (let i = 0, max = all.length; i < max; i++) {
        if (this.searchByParams(all[i], block)) {
          const errors = this.testNode(all[i], block);
          this.foundBlocks.push({
            design: block,
            node: all[i],
            errors: errors
          });
          this.errors = [...this.errors, ...errors];
          this.displayErrorTip(all[i], errors);
          //addClass(all[i], "highlight");
          console.log("target locked!");
          break;
        }
      }
    },
    searchByParams(node, block) {
      if (!node || !block) {
        return false;
      }
      const params = {
        node: node,
        block: block,
        gutter: this.searchGutter
      };
      return this.testBySizes(params) || this.testByPosition(params);
    },
    testNode(node, block) {
      if (!node || !block) {
        return false;
      }
      const params = {
        node: node,
        block: block,
        gutter: this.testGutter
      };
      const errors = [];
      if (!this.testBySizes(params)) {
        doTest("width", "clientWidth");
        doTest("height", "clientHeight");
      }
      if (!this.testByPosition(params)) {
        doTest("top", "offsetTop");
        doTest("left", "offsetLeft");
      }
      return errors;
      function doTest(first, second, name = null) {
        const n = name || first;
        !(Math.abs(block[first] - node[second]) <= params.gutter) &&
          errors.push({
            name: n,
            error: --block[first] - node[second]
          });
      }
    },
    testBySizes({ node, block, gutter }) {
      return (
        Math.abs(block.width - node.clientWidth) <= gutter &&
        Math.abs(block.height - node.clientHeight) <= gutter
      );
    },
    testByPosition({ node, block, gutter }) {
      return (
        Math.abs(block.top - node.offsetTop) <= gutter &&
        Math.abs(block.left - node.offsetLeft) <= gutter
      );
    },
    displayErrorTip: function(node, errors) {
      if (!node || !errors || !errors.length) {
        return;
      }
      const self = this;
      const left = node.offsetLeft + node.clientWidth / 2;
      const top = node.offsetTop + node.clientHeight - 7;
      const point = document.createElement("div");
      const renderErrors = () => {
        let errorsHtml = "";
        errors.forEach(error => {
          errorsHtml += `<li><b>${error.name}: </b>${error.error}px</li>`;
        });
        return errorsHtml;
      };
      point.setAttribute("class", "lky-error-tip");
      point.setAttribute("style", `left: ${left}px; top: ${top}px`);
      point.innerHTML = `
      <div class="lky-point"></div>
        <div class="lky-popup">
          ${
            this.text.errorsFound
          }: <ul class="lky-errors">${renderErrors()}</ul>
        </div>
      </div>`;
      document.body.appendChild(point);
      const pointElem = point.querySelector(".lky-point");
      const popupElem = point.querySelector(".lky-popup");
      pointElem.onmouseover = () => {
        addClass(popupElem, "active");
        self.elementHighlight(node);
      };
      pointElem.onmouseleave = () => {
        removeClass(popupElem, "active");
        self.removeHighlight();
      };
    },
    elementHighlight(node) {
      if (!node) {
        return;
      }
      const styles = node.getBoundingClientRect();
      let div = document.createElement("div");
      div.className = "node-highlight";
      div.style.position = "absolute";
      div.style.content = "";
      div.style.height = `${styles.height + "px"}`;
      div.style.width = `${styles.width + "px"}`;
      div.style.top = `${styles.top + "px"}`;
      div.style.right = `${styles.right + "px"}`;
      div.style.bottom = `${styles.bottom + "px"}`;
      div.style.left = `${styles.left + "px"}`;
      div.style.background = "#05f";
      div.style.opacity = "0.25";
      document.body.appendChild(div);
    },
    removeHighlight() {
      const elems = document.getElementsByClassName("node-highlight");
      for (let elm of elems) {
        document.body.removeChild(elm);
      }
    }
  }
};
</script>

<style lang="scss">
.highlight {
  box-shadow: 0 0 3px 3px #ffff00;
}
.lky-error-tip {
  position: absolute;
  z-index: 101;
  .lky-point {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, 0);
    width: 14px;
    height: 14px;
    background-color: red;
    border: 4px solid #fff;
    border-radius: 50%;
    z-index: 101;
  }
  .lky-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 20px;
    width: 0;
    border-radius: 5px;
    visibility: hidden;
    &.active {
      visibility: visible;
      width: 250px;
      height: auto;
    }
  }
}
.node-highlight {
  z-index: 100;
}
</style>
