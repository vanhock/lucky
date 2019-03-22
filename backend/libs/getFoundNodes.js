module.exports = function(design, nodes) {
  if (!design || !nodes) {
    return;
  }
  const recognize = {
    design: [],
    nodes: [],
    foundNodes: {}
  };
  let currentDesignBlockIndex = null;
  const params = {
    sizesGutter: 5,
    generalSearchGutter: 50,
    searchGutter: 5,
    testGutter: 0,
    maximumParents: 5
  };
  const text = {
    errorsFound: "Обнаружены ошибки",
    width: "Ширина",
    height: "Высота",
    left: "Смещение слева",
    top: "Смещение сверху"
  };
  return new Promise((resolve, reject) => {
    recognize.design = [...design];
    recognize.nodes = nodes;
    recognize.nodes.forEach(node => {
      // Skip found nodes
      currentDesignBlockIndex = null;
      const preFound = !node.skip && node.visible && generalSearch(node);
      if (!preFound) {
        return;
      }
      // Search node with high accuracy
      deepSearchNode(node)
        .then(({ foundNodeIndex, foundDesignIndex }) => {
          if (!foundNodeIndex || !foundDesignIndex) {
            return;
          }
          const foundNode = recognize.nodes[foundNodeIndex];
          const issues = testNode(node, recognize.design[foundDesignIndex]);
          recognize.foundNodes[foundNodeIndex] = {
            id: foundNodeIndex,
            name: setIssueName(foundNode),
            designBlockIndex: foundDesignIndex,
            issues: issues
          };
        })
        .catch(error => {
          console.log(error);
        });
    });

    resolve(recognize.foundNodes);
  });

  function generalSearch(node) {
    const self = this;
    if (node.found) {
      currentDesignBlockIndex = node.found;
      return true;
    }
    for (let i = 0, max = recognize.design.length; i < max; i++) {
      if (
        !recognize.design[i].found &&
        searchByWHLT(
          node,
          recognize.design[i],
          false,
          params.generalSearchGutter
        )
      ) {
        /**
         * We found a matched design block with one node element,
         * and then continue testing this design block carefully
         **/
        currentDesignBlockIndex = i;
        return true;
      }
    }
    return false;
  }

  function searchByDesign(index, full = true, gutter = null) {
    /**
     * Return found design index
     */
    const found = recognize.nodes[index].found;
    if (found) {
      currentDesignBlockIndex = found;
      return found;
    }
    for (let i = 0, max = recognize.design.length; i < max; i++) {
      if (
        !recognize.design[i].found &&
        searchByWHLT(recognize.nodes[index], recognize.design[i], full, gutter)
      ) {
        currentDesignBlockIndex = i;
        return i;
      }
    }
    return false;
  }

  function searchByWHLT(node, block, full, gutter = null) {
    /**
     *  Checking: Width, Height, Left, Top,
     *  return boolean
     */
    if (!node || !block) {
      return false;
    }
    const searchParams = {
      node: node,
      block: block,
      gutter: gutter || params.searchGutter
    };
    const result =
      (full && (testBySizes(searchParams) && testByPosition(searchParams))) ||
      testBySizes(searchParams);
    return result && true || false;
  }

  function deepSearchNode(node) {
    return new Promise((resolve, reject) => {
      /**
       * Test node by this functions,
       * if score < 30% return false,
       * if >= 30, but < 70 - continue testing,
       * else >= 70 return true
       */

      let careFullyMatchedElement = false;
      if (searchByDesign(recognize.nodes.indexOf(node), true, 0)) {
        resolve(findRelevantElement(node));
      }
      const conditions = [
        findNodeSiblings(node),
        findNodeChildren(node),
        findParentsSiblings(node)
      ];
      for (let fn in conditions) {
        if (conditions[fn] === 2) {
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
      resolve(findRelevantElement(node));
    });
  }

  function findNodeSiblings(node) {
    const found = [];
    if (!node.previousSibling && !node.nextSibling) {
      return 1;
    }
    const prevDesignElementIndex =
      node.previousSibling && searchByDesign(node.previousSibling, true);

    const nextDesignElementIndex =
      node.nextSibling && searchByDesign(node.nextSibling, true);

    if (prevDesignElementIndex) {
      found.push(prevDesignElementIndex);
    }
    if (nextDesignElementIndex) {
      found.push(nextDesignElementIndex);
    }
    return getScore(found);
  }

  function findNodeChildren(node) {
    if (!node.children) {
      return 0;
    }
    const children = node.children;
    const found = [];
    children.forEach(c => {
      const designElementIndex = searchByDesign(c, true);
      found.push(designElementIndex);
    });
    if (!found.length) {
      return 0;
    }
    return getScore(found);
  }

  function findParentsSiblings(node) {
    let parentCount = 0;
    lookingParent(node);

    function lookingParent(n) {
      if (!n.parentElement || parentCount > params.maximumParents) {
        return false;
      }
      const parentElement = recognize.nodes[n.parentElement];
      if (findNodeSiblings(parentElement) === 2) {
        return true;
      } else {
        parentCount++;
        lookingParent(parentElement);
      }
    }
  }

  function findRelevantElement(node) {
    /**
     * set Relevant element by traversing children if they exist
     * Return found element index
     */

    const foundNode = getRelevantElement(node);
    if (foundNode) {
      /**
       *  Except parents with same sizes
       */
      exceptParent(foundNode);
      return foundNode;
    }
  }

  function getRelevantElement(node) {
    const foundElementIndex = traversingChildren(node);
    if (foundElementIndex) {
      return foundElementIndex;
    }
    function traversingChildren(node) {
      /**
       * Traversing children of the node
       * for find last child element in the node.
       */
      if (!node) {
        return;
      }
      const children = node.children;
      if (!children) {
        return setFoundBlockIndex(node);
      }
      const sameChildren = [];
      [...children].forEach(i => {
        const c = recognize.nodes[i];
        const dimCheck = node.width === c.width && node.height === c.height;
        if (!dimCheck) {
          return;
        }
        sameChildren.push(c);
      });

      if (!sameChildren.length) {
        return setFoundBlockIndex(node);
      }

      traversingChildren(sameChildren[sameChildren.length]);
    }
  }

  function exceptParent(node) {
    const parent = recognize.nodes[node.parentElement];
    if (!parent) {
      return;
    }
    const dimCheck =
      node.width === parent.width && node.height === parent.height;
    if (dimCheck) {
      setExceptElementFromSearch(parent);
    }
    exceptParent(parent);
  }

  function setExceptElementFromSearch(node) {
    const elementIndex = recognize.nodes.indexOf(node);
    if (elementIndex === -1) {
      return;
    }
    recognize.nodes[elementIndex]["skip"] = true;
  }

  function setFoundBlockIndex(node, designElementIndex) {
    const designIndex = designElementIndex || currentDesignBlockIndex;
    const elementIndex = recognize.nodes.indexOf(node);
    if (elementIndex === -1) {
      return;
    }
    recognize.nodes[elementIndex]["found"] = designIndex;
    recognize.design[designIndex]["found"] = elementIndex;
    // Remove skip flag
    recognize.nodes[elementIndex].hasOwnProperty("skip")
      ? (recognize.nodes[elementIndex]["skip"] = false)
      : "";
    // For Main node traversing in recognizeNodes function
    return { foundNodeIndex: elementIndex, foundDesignIndex: designIndex };
  }

  function testNode(node, block) {
    if (!node || !block) {
      return false;
    }
    const testParams = {
      node: node,
      block: block,
      gutter: params.testGutter
    };
    const issues = [];
    if (!testBySizes(testParams)) {
      setIssue("width", "width", text.width);
      setIssue("height", "height", text.height);
    }
    if (!testByPosition(testParams)) {
      setIssue("top", "top", text.top);
      setIssue("left", "left", text.left);
    }
    return issues;
    function setIssue(first, second, name = null) {
      const n = name || first;
      issues.push({
        name: n,
        designValue: block[second],
        nodeValue: node[first]
      });
    }
  }

  function testBySizes({ node, block, gutter }) {
    const sizeGutter = (gutter === 0 && gutter) || params.sizesGutter;
    return (
      Math.abs(block.width - node.width) <= sizeGutter &&
      Math.abs(block.height - node.height) <= sizeGutter
    );
  }

  function testByPosition({ node, block, gutter }) {
    return (
      Math.abs(block.top - node.top) <= gutter &&
      Math.abs(block.left - node.left) <= gutter
    );
  }

  function setIssueName(node) {
    if (!node) {
      return;
    }
    return (
      node.id ||
      ((node.className && "." + node.className.replace(" ", ".")) ||
        node.tagName)
    ).toUpperCase();
  }

  function getScore(elements) {
    if (!elements || !elements.length) {
      return 0;
    }
    const length = elements.length;
    const quantityOfTrue = elements
      .map(el => (el && 1) || 0)
      .reduce((f, s) => f + s);
    const percentOfTrue = 100 - quantityOfTrue / (length / 100);
    return (
      (percentOfTrue < 30 && 0) ||
      (percentOfTrue >= 30 && percentOfTrue < 70 && 1) ||
      (percentOfTrue >= 70 && 2)
    );
  }
};
