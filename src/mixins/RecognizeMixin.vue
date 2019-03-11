<script>
import { isElementShown } from "../atoms/utils";

export default {
  name: "RecognizeMixin",
  data: () => ({
    recognize: {
      nodes: [],
      design: [],
      foundNodes: {}
    },
    currentDesignBlockIndex: null,
    currentFoundNodeIndex: null,
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
        this.recognize.nodes.forEach(node => {
          // Skip found nodes
          // Search node with high accuracy
          const preFound =
            !node.skip && this.validateNode(node) && self.generalSearch(node);
          if (!preFound) {
            return;
          }

          this.deepSearchNode(node)
            .then(foundNodeIndex => {
              const foundNode = this.recognize.nodes[foundNodeIndex];
              const issues = this.testNode(
                node,
                this.recognize.design[this.currentDesignBlockIndex]
              );
              this.$set(this.recognize.foundNodes, foundNodeIndex, {
                id: foundNodeIndex,
                name: this.setIssueName(foundNode),
                designBlockIndex: this.currentDesignBlockIndex,
                issues: issues
              });
            })
            .catch(error => {
              console.log(error);
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
          this.searchByWHLT(
            node,
            this.recognize.design[i],
            false,
            this.generalSearchGutter
          )
        ) {
          /**
           * We found a matched design block with one node element,
           * and then continue testing this design block carefully
           **/
          this.currentDesignBlockIndex = i;
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
      return isElementShown(node) && requiredParams.every(p => node[p]);
    },
    deepSearchNode(node) {
      return new Promise((resolve, reject) => {
        /**
         * Test node by this functions,
         * if score < 30% return false,
         * if >= 30, but < 70 - continue testing,
         * else >= 70 return true
         */
        const careFullyMatchedElement = trySearch(
          this.findNodeSiblings(node),
          () => {
            return trySearch(this.findNodeChildren(node), () => {
              return trySearch(this.findParentsSiblings(node));
            });
          }
        );
        if (!careFullyMatchedElement) {
          return reject("element not found");
        }
        /**
         * Find element, except elements with same sizes
         * return found Element index
         */
        resolve(this.findRelevantElement(node));
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
      if (!node.previousElementSibling && !node.nextElementSibling) {
        return 1;
      }
      const prevDesignElementIndex =
        node.previousElementSibling &&
        this.searchByDesign(node.previousElementSibling, true);

      const nextDesignElementIndex =
        node.nextElementSibling &&
        this.searchByDesign(node.nextElementSibling, true);

      if (prevDesignElementIndex) {
        found.push(prevDesignElementIndex);
      }
      if (nextDesignElementIndex) {
        found.push(nextDesignElementIndex);
      }
      return this.getScore(found);
    },
    findNodeChildren(node) {
      if (!node.hasChildNodes() || !node.children) {
        return 0;
      }
      const children = [...node.children];
      const self = this;
      const found = [];
      children.forEach(c => {
        const designElementIndex = self.searchByDesign(c, true);
        found.push(designElementIndex);
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
    findRelevantElement(node) {
      /**
       * set Relevant element by traversing children if they exist
       * Return found element index
       */

      const foundNode = this.getRelevantElement(node);
      if (foundNode) {
        /**
         *  Except parents with same sizes
         */
        this.exceptParent(foundNode);
        return foundNode;
      }
    },
    getRelevantElement(node) {
      const self = this;
      const foundElementIndex = traversingChildren(node);
      if (foundElementIndex) {
        return foundElementIndex;
      }
      function traversingChildren(node) {
        /**
         * Traversing children of the node
         * for find last child element in the node.
         */
        const children = node.children;
        if (!children) {
          return self.setFoundBlockIndex(node);
        }
        const sameChildren = [];
        [...children].forEach(c => {
          const dimCheck =
            node.clientWidth === c.clientWidth &&
            node.clientHeight === c.clientHeight;
          if (!dimCheck) {
            return;
          }
          sameChildren.push(c);
        });

        if (!sameChildren.length) {
          return self.setFoundBlockIndex(node);
        }

        traversingChildren(sameChildren[sameChildren.length]);
      }
    },
    exceptParent(node) {
      const parent = node.parentElement;
      if (!parent) {
        return;
      }
      const dimCheck =
        node.clientWidth === parent.clientWidth &&
        node.clientHeight === parent.clientHeight;
      if (dimCheck) {
        this.setExceptElementFromSearch(parent);
      }
      this.exceptParent(parent);
    },
    setExceptElementFromSearch(node) {
      const elementIndex = this.recognize.nodes.indexOf(node);
      if (elementIndex === -1) {
        return;
      }
      this.$set(this.recognize.nodes[elementIndex], "skip", true);
    },
    setFoundBlockIndex(node, designElementIndex) {
      const designIndex = designElementIndex || this.currentDesignBlockIndex;
      const elementIndex = this.recognize.nodes.indexOf(node);
      if (elementIndex === -1) {
        return;
      }
      this.$set(this.recognize.nodes[elementIndex], "found", designIndex);
      this.$set(this.recognize.design[designIndex], "found", elementIndex);
      // Remove skip flag
      this.recognize.nodes[elementIndex].hasOwnProperty("skip") &&
        this.$set(this.recognize.nodes[elementIndex], "skip", false);
      // For Main node traversing in recognizeNodes function
      this.currentFoundNodeIndex = elementIndex;
      return elementIndex;
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
