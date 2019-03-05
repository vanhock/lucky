<script>
export default {
  name: "RecognizeMixin",
  data: () => ({
    nodes: null,
    design: null,
    foundNodes: {},
    currentBlock: {},
    topLevelSearchGutter: 100,
    searchGutter: 50,
    testGutter: 0,
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
    recognizeNodes(design, nodes) {
      const self = this;
      return new Promise(resolve => {
        this.design = [...design];
        this.nodes = [...nodes];
        this.nodes.forEach(node => {
          // Search for top levels of DOM with low accuracy
          // Skip nodes, found by "whlt"
          const found = node.whlt || self.searchByDesign(node, false, this.topLevelSearchGutter);
          if (!found) {
            return;
          }
          // Deep search node => ()
          const issues = this.testNode(node, found);
          this.$set(this.foundNodes, i, {
            id: i,
            name: this.setIssueName(node),
            issues: issues
          });
          this.design[i].found = true;
        });
        this.$store.dispatch("setFoundNodes", this.foundNodes);
        resolve(this.foundNodes);
      });
    },
    searchByDesign(node, full = true, gutter = null) {
      for (let i = 0, max = this.design.length; i < max; i++) {
        if (!this.design[i].found && this.searchByWHLT(node, this.design[i], full, gutter)) {
          return this.design[i];
        }
      }
      return false;
    },
    searchByWHLT(node, block, full, gutter = null) {
      // checking: Width, Height, Left, Top
      if (!node || !block) {
        return false;
      }
      const params = {
        node: node,
        block: block,
        gutter: gutter || this.searchGutter
      };
      return (
        (full && (this.testBySizes(params) && this.testByPosition(params))) ||
        this.testBySizes(params) ||
        this.testByPosition(params)
      );
    },
    deepSearchNode(node) {
      return (
        (this.findNodeSiblings(node) === 2 && true) ||
        (this.findNodeSiblings(node) === 1 && this.findNodeChildren(node) === 2 && true) ||
        false
      );
    },
    findNodeSiblings(node) {
      const prev =
        node.previousElementSibling &&
        searchByDesign(node.previousElementSibling);
      const next =
        node.nextElementSibling && searchByDesign(node.nextElementSibling);
      // if sibling checked, set "whlt" test true
      prev &&
        this.$set(
          this.nodes[this.nodes.indexOf(node.previousElementSibling)],
          "whlt",
          true
        );
      next &&
        this.$set(
          this.nodes[this.nodes.indexOf(node.nextElementSibling)],
          "whlt",
          true
        );
      return this.getScore([prev, next]);
    },
    findNodeChildren(node) {
      return true;
    },
    findParentsSiblings(node) {
      // find siblings on parent node
      return true;
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
        setIssue("width", "clientWidth", this.text.width);
        setIssue("height", "clientHeight", this.text.height);
      }
      if (!this.testByPosition(params)) {
        setIssue("top", "offsetTop", this.text.top);
        setIssue("left", "offsetLeft", this.text.left);
      }
      return errors;
      function setIssue(first, second, name = null) {
        const n = name || first;
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
    },
    getScore(elements) {
      if (!elements || !elements.length) {
        return 0;
      }
      const length = elements.length;
      const quantityOfTrue = elements
        .map(el => (el && 1) || 0)
        .reduce((f, s) => f + s);
      const percentOfTrue = (length / 100) * quantityOfTrue;
      return (
        (percentOfTrue < 30 && 0) ||
        (percentOfTrue >= 30 && percentOfTrue < 70 && 1) ||
        (percentOfTrue >= 70 && 2)
      );
    }
  }
};
</script>
