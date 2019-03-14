<script>
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
        this.recognize.nodes = nodes;
        this.recognize.nodes.forEach(node => {
          // Skip found nodes
          // Search node with high accuracy
          const preFound =
            !node.skip && node.visible && self.generalSearch(node);
          if (!preFound) {
            return;
          }

          this.deepSearchNode(node)
            .then(({foundNodeIndex, foundDesignIndex}) => {
              const foundNode = this.recognize.nodes[foundNodeIndex];
              const issues = this.testNode(
                node,
                this.recognize.design[foundDesignIndex]
              );
              this.$set(this.recognize.foundNodes, foundNodeIndex, {
                id: foundNodeIndex,
                name: this.setIssueName(foundNode),
                designBlockIndex: foundDesignIndex,
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
    searchByDesign(index, full = true, gutter = null) {
      /**
       * Return found design index
       */
      for (let i = 0, max = this.recognize.design.length; i < max; i++) {
        if (
          this.searchByWHLT(
            this.recognize.nodes[index],
            this.recognize.design[i],
            full,
            gutter
          )
        ) {
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
    deepSearchNode(node) {
      return new Promise((resolve, reject) => {
        /**
         * Test node by this functions,
         * if score < 30% return false,
         * if >= 30, but < 70 - continue testing,
         * else >= 70 return true
         */

        let careFullyMatchedElement = false;
        /*careFullyMatchedElement = trySearch(this.findNodeSiblings(node), () => {
          return trySearch(this.findNodeChildren(node), () => {
            return trySearch(this.findParentsSiblings(node));
          });
        });*/
        const conditions = [
          this.findNodeSiblings(node),
          this.findNodeChildren(node),
          this.findParentsSiblings(node)
        ];
        for (let fn in conditions) {
          if (conditions[fn] === 2 || conditions[fn]) {
            careFullyMatchedElement = true;
            break;
          }
        }
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
      if (!node.previousSibling && !node.nextSibling) {
        return 1;
      }
      const prevDesignElementIndex =
        node.previousSibling && this.searchByDesign(node.previousSibling, true);

      const nextDesignElementIndex =
        node.nextSibling && this.searchByDesign(node.nextSibling, true);

      if (prevDesignElementIndex) {
        found.push(prevDesignElementIndex);
      }
      if (nextDesignElementIndex) {
        found.push(nextDesignElementIndex);
      }
      return this.getScore(found);
    },
    findNodeChildren(node) {
      if (!node.children) {
        return 0;
      }
      const children = node.children;
      const self = this;
      const found = [];
      children.forEach(c => {
        const designElementIndex = self.searchByDesign(c, true);
        found.push(designElementIndex);
      });
      if (!found.length) {
        return 0;
      }
      const score = this.getScore(found);
      return score;
    },
    findParentsSiblings(node) {
      let parentCount = 0;
      lookingParent(node);

      function lookingParent(n) {
        if (!n.parentElement || parentCount > this.maximumParents) {
          return false;
        }
        const parentElement = this.recognize.nodes[n.parentElement];
        if (this.findNodeSiblings(parentElement) === 2) {
          return true;
        } else {
          parentCount++;
          lookingParent(parentElement);
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
        [...children].forEach(i => {
          const c = self.recognize.nodes[i];
          const dimCheck = node.width === c.width && node.height === c.height;
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
      const parent = this.recognize.nodes[node.parentElement];
      if (!parent) {
        return;
      }
      const dimCheck =
        node.width === parent.width && node.height === parent.height;
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
      return { foundNodeIndex: elementIndex, foundDesignIndex: designIndex };
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
        setIssue("width", "width", this.text.width);
        setIssue("height", "height", this.text.height);
      }
      if (!this.testByPosition(params)) {
        setIssue("top", "top", this.text.top);
        setIssue("left", "left", this.text.left);
      }
      return errors;
      function setIssue(first, second, name = null) {
        const n = name || first;
        errors.push({
          name: n,
          designValue: block[second],
          nodeValue: node[first]
        });
      }
    },
    testBySizes({ node, block, gutter }) {
      return (
        Math.abs(block.width - node.width) <= gutter &&
        Math.abs(block.height - node.height) <= gutter
      );
    },
    testByPosition({ node, block, gutter }) {
      return (
        Math.abs(block.top - node.top) <= gutter &&
        Math.abs(block.left - node.left) <= gutter
      );
    },
    setIssueName(node) {
      if (!node) {
        return;
      }
      return (
        node.id ||
        ((node.className && "." + node.className.replace(" ", ".")) ||
          node.tagName)
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
