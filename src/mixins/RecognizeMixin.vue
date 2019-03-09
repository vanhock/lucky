<script>
  import {isElementShown} from "../atoms/utils";

  export default {
  name: "RecognizeMixin",
  data: () => ({
    recognize: {
      nodes: [],
      design: [],
      foundNodes: {}
    },
    currentBlock: {},
    generalSearchGutter: 100,
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
          const foundDesignIndex =
            this.validateNode(node) &&
            (node.designBlockIndex ||
            self.generalSearch(node));
          if (!foundDesignIndex || !this.deepSearchNode(node)) {
            return;
          }

          this.setFoundDesignBlockIndex(node, foundDesignIndex);

          const issues = this.testNode(node, this.recognize.design[foundDesignIndex]);
          this.$set(this.recognize.foundNodes, i, {
            id: i,
            name: this.setIssueName(node),
            designBlockIndex: foundDesignIndex,
            issues: issues
          });
        });
        this.$store.dispatch("setFoundNodes", this.recognize.foundNodes);
        resolve(this.recognize.foundNodes);
      });
    },
    generalSearch(node) {
      if (node.found) {
        return;
      }
      for (let i = 0, max = this.recognize.design.length; i < max; i++) {
        if (
          !this.recognize.design[i].found &&
          this.searchByWHLT(node, this.recognize.design[i], false, this.generalSearchGutter)
        ) {
          return i;
        }
      }
      return false;
    },
    searchByDesign(node, full = true, gutter = null) {
      /**
       * Return found design index
       */
      for (let i = 0, max = this.recognize.design.length; i < max; i++) {
        if (this.searchByWHLT(node, this.recognize.design[i], full, gutter)) {
          return i;
        }
      }
      return false;
    },
    searchByWHLT(node, block, full, gutter = null) {
      /**
       *  Checking: Width, Height, Left, Top,
       *  return boolean
       */
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
    validateNode(node) {
      const requiredParams = [
        "clientWidth",
        "clientHeight",
        "offsetLeft",
        "offsetTop"
      ];
      return isElementShown(node) && requiredParams.every(p => node[p])
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
      const prevDesignElementIndex =
        node.previousElementSibling &&
        this.searchByDesign(node.previousElementSibling, true);
      const nextDesignElementIndex =
        node.nextElementSibling &&
        this.searchByDesign(node.nextElementSibling, true);
      // if sibling found, set "whlt" test true
      if(prevDesignElementIndex) {
        found.push(prevDesignElementIndex);
        this.setFoundDesignBlockIndex(node.previousElementSibling, prevDesignElementIndex);
      }
      if(nextDesignElementIndex) {
        found.push(nextDesignElementIndex);
        this.setFoundDesignBlockIndex(node.nextElementSibling, nextDesignElementIndex);
      }
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
        const designElementIndex = self.searchByDesign(c, true);
        found.push(designElementIndex);
        // if child found, set "whlt" test true
        designElementIndex && this.setFoundDesignBlockIndex(c, designElementIndex);
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
    setFoundDesignBlockIndex(node, designElementIndex) {
      const target = this.recognize.nodes.indexOf(node);
      if (target === -1) {
        return;
      }
      this.$set(this.recognize.nodes[target], "designBlockIndex", designElementIndex);
      this.$set(this.recognize.nodes[target], "found", true);
      this.$set(this.recognize.design[designElementIndex], "found", true);
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
