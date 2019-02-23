"use strict";

var isUrl = require("is-url"), // module use to verify the sourceUrl is an actual URL
  cheerio = require("cheerio"), // used to convert raw html into jQuery style object to we can use css selectors
  request = require("request-promise"), // promise based request object
  NodeCache = require("node-cache"), // auto expiring in memory caching collection
  cache = new NodeCache({ stdTTL: 300 }); // cache source HTML for 5 minutes, after which we fetch a new version

module.exports = function(req, res, next) {
  // add res.merge to response object to allow us to fetch template url or use html template string
  res.merge = function(sourceUrl) {
    if (!sourceUrl) {
      // no .sourceUrl, therefore process this as normal
      res
        .status(500)
        .send("No url presented")
        .end();
    } else {
      // resolve the template, either url to jquery object or html
      resolveTemplate(sourceUrl)
        .then(function($template) {
          res.status(200).send($template.html());
        })
        .catch(function(err) {
          // request failed, inform the user
          res
            .status(500)
            .send(err)
            .end();
        });
    }
  };

  next();
};

/**
 * @description Converts source url to $ object
 * @param {string} sourceUrl - url to external html content
 * @returns {Promise} returns promise of html source from sourceUrl
 */
function resolveTemplate(sourceUrl) {
  return new Promise(function(resolve, reject) {
    // if its a url and we have the contents in cache
    if (isUrl(sourceUrl) && cache.get(sourceUrl)) {
      // get source html from cache
      var html = cache.get(sourceUrl);

      // covert html into jquery object
      var $ = cheerio.load(html);

      // return source as a jquery style object
      resolve($);
    } else if (isUrl(sourceUrl)) {
      var params = {
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
          var $ = cheerio.load(html);

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
