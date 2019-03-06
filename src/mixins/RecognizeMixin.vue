<script>
export default {
  name: "RecognizeMixin",
  data: () => ({
    recognize: {
      nodes: [],
      design: [],
      foundNodes: {},
    },
    currentBlock: {},
    topLevelSearchGutter: 100,
    searchGutter: 50,
    testGutter: 0,
    maximumParents: 5,
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
        this.recognize.design = [...design];
        this.recognize.nodes = [...nodes];
        this.recognize.nodes.forEach((node, i) => {
          // Skip nodes, found by "whlt"
          // Search node with high accuracy
          const found =
            node.whlt || self.searchByDesign(node, false, this.topLevelSearchGutter);
          if (!found || !this.deepSearchNode(node)) {
            return;
          }
          const issues = this.testNode(node, found);
          this.$set(this.recognize.foundNodes, i, {
            id: i,
            name: this.setIssueName(node),
            issues: issues
          });
          this.recognize.nodes[i].found = true;
        });
        this.$store.dispatch("setFoundNodes", this.recognize.foundNodes);
        resolve(this.recognize.foundNodes);
      });
    },
    searchByDesign(node, full = true, gutter = null) {
      for (let i = 0, max = this.recognize.design.length; i < max; i++) {
        if (
          !this.recognize.nodes[i].found &&
          this.searchByWHLT(node, this.recognize.design[i], full, gutter)
        ) {
          return this.recognize.design[i];
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
      return trySearch(this.findNodeSiblings(node), () => {
        return trySearch(this.findNodeChildren(node), () => {
          return trySearch(this.findParentsSiblings(node));
        });
      });

      function trySearch(func, callback) {
        if (func === true || func === false) {
          return func;
        }
        if (func === 2) {
          return true;
        } else if (func === 1) {
          callback();
        } else {
          return false;
        }
      }
    },
    findNodeSiblings(node) {
      const found = [];
      const prev =
        node.previousElementSibling &&
        this.searchByDesign(node.previousElementSibling, true);
      const next =
        node.nextElementSibling &&
        this.searchByDesign(node.nextElementSibling, true);
      // if sibling found, set "whlt" test true
      prev && found.push(this.setFoundWhlt(node.previousElementSibling));
      next && found.push(this.setFoundWhlt(node.nextElementSibling));
      return this.getScore(found);
    },
    findNodeChildren(node) {
      const children = node.children;
      if (!children || !children.length) {
        return 0;
      }
      const self = this;
      const found = [];
      children.forEach(c => {
        const elementFound = self.searchByDesign(c, true);
        found.push(elementFound);
        // if child found, set "whlt" test true
        elementFound && this.setFoundWhlt(c);
      });
      if (!found.length) {
        return 0;
      }
      return this.getScore(found);
    },
    findParentsSiblings(node) {
      let parentCount = 0;
      lookingParent(node);

      function lookingParent(n) {
        if (!n.parentElement || parentCount > this.maximumParents) {
          return;
        }
        if (this.findNodeSiblings(n.parentElement) === 2) {
          return true;
        } else {
          parentCount++;
          lookingParent(n.parentElement);
        }
      }
    },
    setFoundWhlt(node) {
      const target = this.recognize.nodes.indexOf(node);
      if (target === -1) {
        return;
      }
      this.$set(this.recognize.nodes[target], "whlt", true);
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
      const percentOfTrue = (length * 100) / quantityOfTrue;
      return (
        (percentOfTrue < 30 && 0) ||
        (percentOfTrue >= 30 && percentOfTrue < 70 && 1) ||
        (percentOfTrue >= 70 && 2)
      );
    }
  }
};
</script>
