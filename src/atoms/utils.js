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
