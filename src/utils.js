import moment from "moment";

export const hasClass = function(el, className) {
  return (" " + el.className + " ").indexOf(" " + className + " ") > -1;
};

export const addClass = function(el, className) {
  if (el.classList) el.classList.add(className);
  else if (!hasClass(el, className)) el.className += " " + className;
};

export const removeClass = function(el, className) {
  if (el.classList) el.classList.remove(className);
  else if (hasClass(el, className)) {
    var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
    el.className = el.className.replace(reg, " ");
  }
};
export const exist = function(el) {
  if (el !== null && el !== undefined) {
    return true;
  }
};

export const objectLength = function(object) {
  return object && typeof object === "object" && Object.entries(object).length;
};

/**
 * Возвращает значение параметра по имени и url
 * @param name
 * @param url
 * @returns {string}
 */
export const getParameterByName = function(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export const setCookie = function(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];

    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
};

export const deleteCookie = function(name) {
  setCookie(name, "", {
    expires: -1,
    path: "/"
  });
};

export const getCookie = function(name) {
  var matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

/**
 * Функция возвращает родитель элемента по классу
 * @param el
 * @param cls
 * @returns {*}
 */

export const parents = function(el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
};

export const camelize = function(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, "");
};

export const getIndexByProperty = function(array, prop, name) {
  let i = null;
  array.forEach((item, index) => {
    if (item[prop] === name) {
      i = index;
    }
  });
  if (i !== null) {
    return i;
  }
};

export const serialize = function(form) {
  let obj = {},
    elements = form.querySelectorAll("input, select, textarea");
  for (let i = 0; i < elements.length; ++i) {
    let element = elements[i],
      name = element.name,
      value = element.value;

    if (name) {
      obj[name] = value;
    }
  }

  return obj;
};

export const serializeObject = function(object) {
  const parameters = [];
  for (let property in object) {
    if (object.hasOwnProperty(property)) {
      parameters.push(encodeURI(property + "=" + object[property]));
    }
  }

  return parameters.join("&");
};

export const getChild = function(elem, classname) {
  for (let i = 0; i < elem.childNodes.length; i++) {
    if (
      elem.childNodes[i].className !== undefined
        ? elem.childNodes[i].className.includes(classname)
        : false
    ) {
      return elem.childNodes[i];
    }
  }
};

export const scrollTo = function(element, to, duration) {
  let start = element.scrollTop,
    change = to - start,
    currentTime = 0,
    increment = 20;

  let animateScroll = function() {
    currentTime += increment;
    let val = Math.easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
};
Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

export const arraysEqual = function(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const getElemByPosition = function(elems, scroll) {
  let counter = 0;
  if (elems && elems.length > 0) {
    elems.forEach(elem => {
      let el = document.querySelector(
        'section[data-id="' + elem.getAttribute("data-id") + '"]'
      );
      if (scroll <= 100) {
        counter = 0;
      } else if (
        scroll > el.offsetTop - el.clientHeight - 60 &&
        counter < elems.length
      ) {
        counter++;
      }
    });
    return counter === 0 ? elems[0] : elems[counter - 1];
  }
};
/**
 * Поиск значения по ключу во вложенном объекте
 * @param o
 * @param id
 * @returns {*}
 */
export const findById = function(o, id) {
  if (o.hasOwnProperty(id)) {
    return o[id];
  }
  let result, p;
  for (p in o) {
    if (o.hasOwnProperty(p) && typeof o[p] === "object") {
      result = findById(o[p], id);
      if (result) {
        return result;
      }
    }
  }
  return result;
};
/**
 * Возвращает индекс элемента из NodeList
 * @param el
 * @returns {number}
 */

export const getNodeIndex = function(el, parent) {
  let children = el.closest(parent).querySelectorAll("." + el.className),
    i = 0;
  for (; i < children.length; i++) {
    if (children[i] === el) {
      return i;
    }
  }
  return -1;
};

export const getIndexByChatId = function(chats, chatId) {
  for (let i = 0; i < chats.length; i++) {
    if (chats[i].chatId === chatId) {
      return i;
    }
  }
  return -1;
};

/**
 * Return chat by user id.
 * In case of development issue - multiple cahts with same user - methid returns first founded chat.
 *
 * @param {int} userId
 *
 * @return {Object}
 **/
export const getChatByUserId = function(chats, userId) {
  for (let chat of chats) {
    if (chat.userId == userId) {
      return chat;
    }
  }
  return null;
};

/**
 * Return caret (cursor) position of input
 *
 * @param {node} editableDiv
 *
 * @return {int}
 **/

export const getCaretPosition = function(editableDiv) {
  let caretPos = 0,
    sel,
    range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      let tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      let tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
};

/**
 * Img from document to base64
 * @param img
 * @returns {string}
 */
export const getBase64Image = function(img) {
  let reader = new FileReader();
  reader.readAsDataURL(img);
  reader.onload = function() {
    return reader.result;
  };
};
/**
 * Base64 img to blob
 * @param dataURI
 * @returns {Blob}
 */
export const data2blob = function(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(",")[0].indexOf("base64") >= 0)
    byteString = atob(dataURI.split(",")[1]);
  else byteString = unescape(dataURI.split(",")[1]);
  // separate out the mime component
  let mimeString = dataURI
    .split(",")[0]
    .split(":")[1]
    .split(";")[0];
  // write the bytes of the string to a typed array
  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeString });
};

export const isSiteOnline = function(url, callback) {
  // try to load favicon
  const timer = setTimeout(function() {
    // timeout after 5 seconds
    callback(false);
  }, 5000);

  const img = document.createElement("img");
  img.onload = function() {
    clearTimeout(timer);
    callback(true);
  };

  img.onerror = function() {
    clearTimeout(timer);
    callback(false);
  };

  img.src = url + "/favicon.ico";
};

export const getElementBounding = function(el, currentWindow) {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + currentWindow.pageYOffset,
    left: rect.left + currentWindow.pageXOffset,
    width: rect.width,
    height: rect.height
  };
};

export const getParentAndChild = function(list) {
  return list.map(getPairsForNode).reduce((arr1, arr2) => arr1.concat(arr2));
};

export const getPairsForNode = function(node) {
  if (node.children)
    return node.children
      .map(child => getPairsForNode(child))
      .concat(node.children)
      .reduce((arr1, arr2) => arr1.concat(arr2));
  else return [node];
};

export const relToAbs = function(url, serverUrl) {
  if (
    /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)
  )
    return url; //Url is already absolute

  const base_url =
    `${serverUrl}/proxy/${url}`.match(/^(.+)\/?(?:#.+)?$/)[0] + "/";
  if (url.substring(0, 2) == "//") return location.protocol + url;
  else if (url.charAt(0) == "/")
    return location.protocol + "//" + location.host + url;
  else if (url.substring(0, 2) == "./") url = "." + url;
  else if (/^\s*$/.test(url)) return "";
  //Empty = Return nothing
  else url = "../" + url;

  url = base_url + url;
  while (/\/\.\.\//.test((url = url.replace(/[^\/]+\/+\.\.\//g, ""))));

  /* Escape certain characters to prevent XSS */
  url = url
    .replace(/\.$/, "")
    .replace(/\/\./g, "")
    .replace(/"/g, "%22")
    .replace(/'/g, "%27")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");
  return url;
};

export const addToLocal = function(item, name, value) {
  const localItem = localStorage.getItem(item);
  let o = {};
  if (localItem) {
    o = JSON.parse(localItem);
  }
  o[name] = value;
  localStorage.setItem(item, JSON.stringify(o));
};

export const getFromLocal = function(item) {
  return localStorage.getItem(item) && JSON.parse(localStorage.getItem(item));
};

export const removeFromLocal = function(item, name) {
  if (item) {
    const localItem =
      localStorage.getItem(item) && JSON.parse(localStorage.getItem(item));
    if (localItem && localItem.hasOwnProperty(name)) {
      delete localItem[name];
      localStorage.setItem(item, JSON.stringify(localItem));
    }
  } else {
    localStorage.removeItem(item);
  }
};

export const extractHostname = function(url) {
  let hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
};

export const detectMouseButton = function(evt) {
  evt = evt || window.event;
  return evt.isTrusted;
};

export const isElementShown = function(el, currentWindow) {
  const w = currentWindow || window;
  const style = w.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    el.offsetWidth > 0 &&
    el.offsetHeight > 0
  );
};
export const simplifyDom = function(dom, currentWindow) {
  /**
   * Allowed params:
   * 1. width, height
   * 2. left, top
   * 3. visible
   * 4. className, id, tagName
   * 5. children, parent
   */
  if (!dom || !dom.length) {
    return;
  }
  const _dom = [...dom];
  const simplified = [];
  const allowedParams = [
    "index",
    "width",
    "height",
    "left",
    "top",
    "visible",
    "className",
    "id",
    "tagName",
    "children",
    "parent",
    "previousSibling",
    "nextSibling",
    "text",
    "image"
  ];
  _dom.forEach((node, index) => {
    const elementBounding = getElementBounding(node, currentWindow);
    const target = convertToObject(node);
    target.index = index;
    target.width = node.clientWidth || elementBounding.width;
    target.height = node.clientHeight || elementBounding.height;
    target.left = elementBounding.left;
    target.top = elementBounding.top;

    target.visible = isElementShown(node, currentWindow);
    /**
     * Check element on including text or image data
     */
    if (target.nodeName === "IMG") {
      target.image = target.src;
    }
    if (target.innerText && target.innerText !== "") {
      target.text = target.innerText.trim().toLowerCase();
    }
    /**
     * Set child element index, if child element exist
     */
    if (target.children && target.children.length) {
      target.children = [...node.children].map(c => getNodeIndex(_dom, c));
    } else {
      delete target.children;
    }
    /**
     * Set parent element index, if child element exist
     */
    if (target.parentElement && target.parentElement.length) {
      target.parentElement = getNodeIndex(_dom, node.parentElement);
    } else {
      delete target.parentElement;
    }
    /**
     * Set siblings indexes, if they exist
     */
    if (node.previousElementSibling && node.previousElementSibling.length) {
      target.previousSibling = getNodeIndex(_dom, node.previousElementSibling);
    } else {
      delete target.previousSibling;
    }
    if (node.nextElementSibling && node.nextElementSibling.length) {
      target.nextSibling = getNodeIndex(_dom, node.nextElementSibling);
    } else {
      delete target.nextSibling;
    }

    simplified.push(
      Object.keys(target)
        .filter(key => allowedParams.includes(key))
        .reduce((obj, key) => {
          obj[key] = target[key];
          return obj;
        }, {})
    );
  });

  return simplified;

  function getNodeIndex(nodeList, node) {
    return (nodeList.indexOf(node) !== -1 && nodeList.indexOf(node)) || null;
  }

  function convertToObject(node) {
    const obj = {};
    for (let p in node) {
      obj[p] = node[p];
    }
    return obj;
  }
};

export const normalizeData = function(date) {
  if (moment().diff(moment(date), "hours") <= 24) {
    return moment(date).fromNow();
  } else {
    return moment(date).format("D.MM.YY");
  }
};
