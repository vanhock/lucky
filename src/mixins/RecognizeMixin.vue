<script>
import PSD from "../psd.json";

export default {
  name: "RecognizeMixin",
  data: () => ({
    targetLocked: false,
    currentBlock: {},
    searchGutter: 50,
    testGutter: 0,
    foundBlocks: [],
    errors: [],
    text: {
      errorsFound: "Обнаружены ошибки",
      width: "Ширина",
      height: "Высота",
      left: "Смещение слева",
      top: "Смещение сверху"
    }
  }),
  methods: {
    setDesignMarkup() {
      this.$store.dispatch("setDesignMarkup", PSD);
    },
    testPage(design, nodes) {
      const _nodes = [...nodes];
      design.forEach(item => {
        for (let i = 0, max = _nodes.length; i < max; i++) {
          if (this.searchByParams(_nodes[i], item)) {
            const errors = this.testNode(_nodes[i], item);
            this.foundBlocks.push({
              name: this.setIssueName(_nodes[i]),
              design: item,
              node: _nodes[i],
              errors: errors
            });
            this.displayErrorTip(_nodes[i], errors);
            _nodes.splice(i, 1);
            break;
          }
        }
      });
      this.$store.dispatch("setFoundIssues", this.foundBlocks);
      this.errorTipEffects();
      localStorage.setItem("savedDesign", JSON.stringify(this.foundBlocks));
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
      return this.testBySizes(params) && this.testByPosition(params);
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
        doTest("width", "clientWidth", this.text.width);
        doTest("height", "clientHeight", this.text.height);
      }
      if (!this.testByPosition(params)) {
        doTest("top", "offsetTop", this.text.top);
        doTest("left", "offsetLeft", this.text.left);
      }
      return errors;
      function doTest(first, second, name = null) {
        const n = name || first;
        !(Math.abs(block[first] - node[second]) <= params.gutter) &&
          errors.push({
            name: n,
            designValue: node[second],
            nodeValue: block[first]
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
    setIssueName(node) {
      if (!node) {
        return;
      }
      return (
        node.id ||
        ((node.className && "." + node.className.replace(" ", ".")) ||
          node.nodeName)
      ).toUpperCase();
    }
  }
};
</script>
