module.exports = function(design, nodes) {
  const recognize = {
    design: [],
    nodes: [],
    foundNodes: {},
    currentRecognizedNode: null
  };
  const params = {
    sizesGutter: 5,
    positionGutter: 40,
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
    if (!design || !nodes) {
      return reject("Design or Nodes not found");
    }
    recognize.design = [...design];
    recognize.nodes = nodes;
    recognize.nodes.forEach(node => {
      // Skip found nodes
      if (node.found || !node.visible) {
        return;
      }
      /** Search by sizes and position **/
      const foundByGeneralSearch = generalSearch(
        node,
        params.generalSearchGutter
      );
      if (!Object.keys(foundByGeneralSearch).length) {
        return;
      }
      setFoundNode(node, foundByGeneralSearch.index);
      /*if (foundByGeneralSearch.absolute) {
        setFoundNode(node, foundByGeneralSearch.index);
      } else {
        /!** Search node with high accuracy **!/
        deepSearchNode(node, foundDesignIndex => {
          if (foundDesignIndex) {
            setFoundNode(node, foundDesignIndex);
          }
        });
      }*/
    });

    resolve(recognize.foundNodes);
  });

  function setFoundNode(node, foundDesignIndex) {
    const foundNode = recognize.nodes[node.index];
    const issues = testNode(node, recognize.design[foundDesignIndex]);
    recognize.foundNodes[node.index] = {
      id: node.index,
      name: setIssueName(foundNode),
      designBlockIndex: foundDesignIndex,
      issues: issues
    };
    /** Except found node and design from search **/
    recognize.nodes[node.index].found = foundDesignIndex;
    recognize.design[foundDesignIndex].found = node.index;
  }

  function generalSearch(node, gutter) {
    const foundByDesign = [];
    for (
      let designIndex = 0, max = recognize.design.length;
      designIndex < max;
      designIndex++
    ) {
      /** Skip already found design element **/
      if (recognize.design[designIndex].found) {
        continue;
      }
      /** Try to find fully matched element with sizes and position **/
      const tryFindAbsolutely = fullMatchesSearch(node, designIndex);
      if (tryFindAbsolutely) {
        return { index: designIndex, absolute: true };
      }
      /**
       * Find matched element
       * and add to foundByDesign array for getting design,
       * found by lowest gutter
       **/
      const foundNodeGutter = searchBySizesAndPosition(
        node,
        recognize.design[designIndex],
        gutter
      );
      if (foundNodeGutter === undefined) {
        continue;
      }
      foundByDesign.push({ index: designIndex, ...foundNodeGutter });
    }

    if (!foundByDesign.length) {
      return {};
    }
    const minSizesGutter = findMinMax(
      foundByDesign,
      "gutterBySizes",
      "gutterBySizes"
    )[0];
    const minPositionGutter = findMinMax(
      foundByDesign,
      "gutterByPosition",
      "gutterByPosition"
    )[0];
    const filteredByMinGutter = foundByDesign.filter(item => {
      return (
        item.gutterBySizes === minSizesGutter &&
        item.gutterByPosition === minPositionGutter
      );
    });
    /** Get design index with lowest gutter **/
    if (filteredByMinGutter.length) {
      return { index: filteredByMinGutter[0].index, absolute: false };
    }
  }

  function fullMatchesSearch(node, designIndex) {
    /**
     * Find node, matched with design block by sizes and position without gutter
     * Return found design index or false
     **/
    const searchParams = {
      node: node,
      block: recognize.design[designIndex],
      gutter: 0
    };
    return testBySizes(searchParams) && testByPosition(searchParams);
  }

  function searchBySizesAndPosition(node, block) {
    /**
     * Checking: Width, Height, Left, Top
     **/
    if (!node || !block) {
      return false;
    }
    const searchParams = {
      node: node,
      block: block
    };
    /** We get gutter, where a match is found **/
    const gutterBySizes = testBySizes({
      ...searchParams,
      gutter: params.sizesGutter
    });
    const gutterByPosition = testByPosition({
      ...searchParams,
      gutter: params.positionGutter
    });
    if (!gutterByPosition || !gutterBySizes) {
      return;
    }
    return { gutterBySizes: gutterBySizes, gutterByPosition: gutterByPosition };
  }

  function deepSearchNode(found, cb) {
    /**
     * Test node by this functions,
     * if score < 30% return false,
     * if >= 30, but < 70 - continue testing,
     * else >= 70 return true
     */
    const conditions = [
      findNodeSiblings(found),
      findNodeChildren(found),
      findParentsSiblings(found)
    ];
    for (let fn in conditions) {
      if (conditions[fn] === 2) {
        cb(true);
      }
    }
  }

  function findNodeSiblings(node) {
    const found = [];
    if (!node.previousSibling && !node.nextSibling) {
      return 1;
    }
    const siblings = [node.previousSibling, !node.nextSibling];
    siblings.forEach(node => {
      if (!node) {
        return;
      }
      generalSearch(node.previousSibling, true, foundDesign => {
        if (foundDesign) {
          found.push(foundDesign.index);
        }
        foundDesign.absolute && setFoundNode(node, foundDesign.index);
      });
    });
    return getScore(found);
  }

  function findNodeChildren(node) {
    if (!node.children) {
      return 1;
    }
    const children = node.children;
    const found = [];
    children.forEach(c => {
      const designElementIndex = generalSearch(c, true);
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
        return 2;
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
       * for find last child element in the node with same sizes.
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
    if (!dimCheck) {
      return;
    }
    setExceptElementFromSearch(parent);
    exceptParent(parent);
  }

  function setExceptElementFromSearch(node) {
    const elementIndex = recognize.nodes.indexOf(node);
    if (elementIndex === -1) {
      return;
    }
    recognize.nodes[elementIndex]["skip"] = true;
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
    const width = Math.abs(block.width - node.width);
    const height = Math.abs(block.height - node.height);
    if (width <= gutter && height <= gutter) {
      /** returns average gutter **/
      return average(width, height);
    }
  }

  function testByPosition({ node, block, gutter }) {
    const top = Math.abs(block.top - node.top) <= gutter;
    const left = Math.abs(block.left - node.left) <= gutter;
    if (top <= gutter && left <= gutter) {
      /** returns average gutter **/
      return average(top, left);
    }
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
  function average() {
    let sum = 0;

    for (let i = 0; i < arguments[i]; i++) sum += arguments[i];

    return sum === 0 ? sum : sum / arguments.length;
  }
  function findMinMax(arr, fieldName, resultFieldName) {
    let min = arr[0][fieldName],
      max = arr[0][fieldName];
    let resMin = arr[0][resultFieldName];
    let resMax = arr[0][resultFieldName];
    for (let i = 1, len = arr.length; i < len; i++) {
      let v = arr[i][fieldName];
      if (v < min) {
        min = v;
        resMin = arr[i][resultFieldName];
      } else if (v > max) {
        max = v;
        resMax = arr[i][resultFieldName];
      }
    }
    return [resMin, resMax];
  }
};
