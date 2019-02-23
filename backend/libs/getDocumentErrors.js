const isUrl = require("is-url"), // module use to verify the sourceUrl is an actual URL
  cheerio = require("cheerio"), // used to convert raw html into jQuery style object to we can use css selectors
  request = require("request-promise"); // promise based request object
  //NodeCache = require("node-cache"); // auto expiring in memory caching collection
  //cache = new NodeCache({ stdTTL: 300 }); // cache source HTML for 5 minutes, after which we fetch a new version

module.exports = function(design, nodes, cb) {
  const searchGutter = 50;
  const testGutter = 0;
  const errors = [];
  const foundBlocks = [];

  if (!design || !nodes) {
    return;
  }

  design.forEach(item => {
    for (let i = 0, max = nodes.length; i < max; i++) {
      if (searchByParams(nodes[i], item)) {
        const errors = testNode(nodes[i], item);
        foundBlocks.push({
          design: item,
          node: nodes[i],
          errors: errors
        });
        break;
      }
    }
  });
  cb(foundBlocks);


  function resolveTemplate(sourceUrl) {
    return new Promise(function(resolve, reject) {
      // if its a url and we have the contents in cache
      if (isUrl(sourceUrl) && cache.get(sourceUrl)) {
        // get source html from cache
        const html = cache.get(sourceUrl);

        // covert html into jquery object
        const $ = cheerio.load(html);

        // return source as a jquery style object
        resolve($);
      } else if (isUrl(sourceUrl)) {
        const params = {
          uri: sourceUrl,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36"
          }
        };

        // request the source url
        return request(params)
          .then(function(html) {
            // convert html into jquery style object so we can use selectors
            const $ = cheerio.load(html);

            // insert base tag to ensure links/scripts/styles load correctly
            $("head").prepend('<base href="' + sourceUrl + '">');

            // cache result as HTML so we dont have to keep getting it for future requests and it remains clean
            cache.set(sourceUrl, $.html());

            // resolve with jquery object containing content
            resolve($);
          })
          .catch(function(err) {
            // request failed
            reject("Unable to retrieve " + sourceUrl);
          });
      } else {
        // the sourceUrl must contain markup, just return it
        resolve(sourceUrl);
      }
    });
  }

  function searchByParams(node, block) {
    if (!node || !block) {
      return false;
    }
    const params = {
      node: node,
      block: block,
      gutter: searchGutter
    };
    return testBySizes(params) && testByPosition(params);
  }

  function testNode(node, block) {
    if (!node || !block) {
      return false;
    }
    const params = {
      node: node,
      block: block,
      gutter: testGutter
    };
    const errors = [];
    if (!testBySizes(params)) {
      doTest("width", "width");
      doTest("height", "height");
    }
    if (!testByPosition(params)) {
      doTest("top", "top");
      doTest("left", "left");
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
  }

  function testBySizes({ node, block, gutter }) {
    return (
      Math.abs(block.width - node.width) <= gutter &&
      Math.abs(block.height - node.height) <= gutter
    );
  }

  function testByPosition({ node, block, gutter }) {
    return (
      Math.abs(block.top - node.top) <= gutter &&
      Math.abs(block.left - node.left) <= gutter
    );
  }
};

