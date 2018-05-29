var PlainDraggable =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/plain-draggable.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/anim-event/anim-event.esm.js":
/*!***************************************************!*\
  !*** ./node_modules/anim-event/anim-event.esm.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

/*
 * AnimEvent
 * https://github.com/anseki/anim-event
 *
 * Copyright (c) 2018 anseki
 * Licensed under the MIT license.
 */

var MSPF = 1000 / 60,
    // ms/frame (FPS: 60)
KEEP_LOOP = 500,


/**
 * @typedef {Object} task
 * @property {Event} event
 * @property {function} listener
 */

/** @type {task[]} */
tasks = [];

var requestAnim = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
  return setTimeout(callback, MSPF);
},
    cancelAnim = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || function (requestID) {
  return clearTimeout(requestID);
},
    requestID = void 0,
    lastFrameTime = Date.now();

function step() {
  var called = void 0,
      next = void 0;

  if (requestID) {
    cancelAnim.call(window, requestID);
    requestID = null;
  }

  tasks.forEach(function (task) {
    if (task.event) {
      task.listener(task.event);
      task.event = null;
      called = true;
    }
  });

  if (called) {
    lastFrameTime = Date.now();
    next = true;
  } else if (Date.now() - lastFrameTime < KEEP_LOOP) {
    // Go on for a while
    next = true;
  }
  if (next) {
    requestID = requestAnim.call(window, step);
  }
}

function indexOfTasks(listener) {
  var index = -1;
  tasks.some(function (task, i) {
    if (task.listener === listener) {
      index = i;
      return true;
    }
    return false;
  });
  return index;
}

var AnimEvent = {
  /**
   * @param {function} listener - An event listener.
   * @returns {(function|null)} A wrapped event listener.
   */
  add: function add(listener) {
    var task = void 0;
    if (indexOfTasks(listener) === -1) {
      tasks.push(task = { listener: listener });
      return function (event) {
        task.event = event;
        if (!requestID) {
          step();
        }
      };
    } else {
      return null;
    }
  },

  remove: function remove(listener) {
    var iRemove = void 0;
    if ((iRemove = indexOfTasks(listener)) > -1) {
      tasks.splice(iRemove, 1);
      if (!tasks.length && requestID) {
        cancelAnim.call(window, requestID);
        requestID = null;
      }
    }
  }
};

/* harmony default export */ __webpack_exports__["default"] = (AnimEvent);

/***/ }),

/***/ "./node_modules/cssprefix/cssprefix.esm.js":
/*!*************************************************!*\
  !*** ./node_modules/cssprefix/cssprefix.esm.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

/*
 * CSSPrefix
 * https://github.com/anseki/cssprefix
 *
 * Copyright (c) 2018 anseki
 * Licensed under the MIT license.
 */

function ucf(text) {
  return text.substr(0, 1).toUpperCase() + text.substr(1);
}

var PREFIXES = ['webkit', 'moz', 'ms', 'o'],
    NAME_PREFIXES = PREFIXES.reduce(function (prefixes, prefix) {
  prefixes.push(prefix);
  prefixes.push(ucf(prefix));
  return prefixes;
}, []),
    VALUE_PREFIXES = PREFIXES.map(function (prefix) {
  return '-' + prefix + '-';
}),


/**
 * Get sample CSSStyleDeclaration.
 * @returns {CSSStyleDeclaration}
 */
getDeclaration = function () {
  var declaration = void 0;
  return function () {
    return declaration = declaration || document.createElement('div').style;
  };
}(),


/**
 * Normalize name.
 * @param {} propName - A name that is normalized.
 * @returns {string} A normalized name.
 */
normalizeName = function () {
  var rePrefixedName = new RegExp('^(?:' + PREFIXES.join('|') + ')(.)', 'i'),
      reUc = /[A-Z]/;
  return function (propName) {
    return (propName = (propName + '').replace(/\s/g, '').replace(/-([\da-z])/gi, function (str, p1) {
      return p1.toUpperCase();
    }) // camelCase
    // 'ms' and 'Ms' are found by rePrefixedName 'i' option
    .replace(rePrefixedName, function (str, p1) {
      return reUc.test(p1) ? p1.toLowerCase() : str;
    }) // Remove prefix
    ).toLowerCase() === 'float' ? 'cssFloat' : propName;
  }; // For old CSSOM
}(),


/**
 * Normalize value.
 * @param {} propValue - A value that is normalized.
 * @returns {string} A normalized value.
 */
normalizeValue = function () {
  var rePrefixedValue = new RegExp('^(?:' + VALUE_PREFIXES.join('|') + ')', 'i');
  return function (propValue) {
    return (propValue != null ? propValue + '' : '').replace(/\s/g, '').replace(rePrefixedValue, '');
  };
}(),


/**
 * Polyfill for `CSS.supports`.
 * @param {string} propName - A name.
 * @param {string} propValue - A value.
 *     Since `CSSStyleDeclaration.setProperty` might return unexpected result,
 *     the `propValue` should be checked before the `cssSupports` is called.
 * @returns {boolean} `true` if given pair is accepted.
 */
cssSupports = function () {
  return (
    // return window.CSS && window.CSS.supports || ((propName, propValue) => {
    // `CSS.supports` doesn't find prefixed property.
    function (propName, propValue) {
      var declaration = getDeclaration();
      // In some browsers, `declaration[prop] = value` updates any property.
      propName = propName.replace(/[A-Z]/g, function (str) {
        return '-' + str.toLowerCase();
      }); // kebab-case
      declaration.setProperty(propName, propValue);
      return declaration[propName] != null && // Because getPropertyValue returns '' if it is unsupported
      declaration.getPropertyValue(propName) === propValue;
    }
  );
}(),


// Cache
propNames = {},
    propValues = {};

function getName(propName) {
  propName = normalizeName(propName);
  if (propName && propNames[propName] == null) {
    var declaration = getDeclaration();

    if (declaration[propName] != null) {
      // Original
      propNames[propName] = propName;
    } else {
      // Try with prefixes
      var ucfName = ucf(propName);
      if (!NAME_PREFIXES.some(function (prefix) {
        var prefixed = prefix + ucfName;
        if (declaration[prefixed] != null) {
          propNames[propName] = prefixed;
          return true;
        }
        return false;
      })) {
        propNames[propName] = false;
      }
    }
  }
  return propNames[propName] || void 0;
}

function getValue(propName, propValue) {
  var res = void 0;

  if (!(propName = getName(propName))) {
    return res;
  } // Invalid property

  propValues[propName] = propValues[propName] || {};
  (Array.isArray(propValue) ? propValue : [propValue]).some(function (propValue) {
    propValue = normalizeValue(propValue);

    if (propValues[propName][propValue] != null) {
      // Cache
      if (propValues[propName][propValue] !== false) {
        res = propValues[propName][propValue];
        return true;
      }
      return false; // Continue to next value
    }

    if (cssSupports(propName, propValue)) {
      // Original
      res = propValues[propName][propValue] = propValue;
      return true;
    }

    if (VALUE_PREFIXES.some(function (prefix) {
      // Try with prefixes
      var prefixed = prefix + propValue;
      if (cssSupports(propName, prefixed)) {
        res = propValues[propName][propValue] = prefixed;
        return true;
      }
      return false;
    })) {
      return true;
    }

    propValues[propName][propValue] = false;
    return false; // Continue to next value
  });

  return typeof res === 'string' ? res : void 0; // It might be empty string.
}

var CSSPrefix = {
  getName: getName,
  getValue: getValue
};

/* harmony default export */ __webpack_exports__["default"] = (CSSPrefix);

/***/ }),

/***/ "./node_modules/m-class-list/m-class-list.esm.js":
/*!*******************************************************!*\
  !*** ./node_modules/m-class-list/m-class-list.esm.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

/*
 * mClassList
 * https://github.com/anseki/m-class-list
 *
 * Copyright (c) 2018 anseki
 * Licensed under the MIT license.
 */

function normalize(token) {
  return (token + '').trim();
} // Not `||`
function applyList(list, element) {
  element.setAttribute('class', list.join(' '));
}

function _add(list, element, tokens) {
  if (tokens.filter(function (token) {
    if (!(token = normalize(token)) || list.indexOf(token) !== -1) {
      return false;
    }
    list.push(token);
    return true;
  }).length) {
    applyList(list, element);
  }
}

function _remove(list, element, tokens) {
  if (tokens.filter(function (token) {
    var i = void 0;
    if (!(token = normalize(token)) || (i = list.indexOf(token)) === -1) {
      return false;
    }
    list.splice(i, 1);
    return true;
  }).length) {
    applyList(list, element);
  }
}

function _toggle(list, element, token, force) {
  var i = list.indexOf(token = normalize(token));
  if (i !== -1) {
    if (force) {
      return true;
    }
    list.splice(i, 1);
    applyList(list, element);
    return false;
  }
  if (force === false) {
    return false;
  }
  list.push(token);
  applyList(list, element);
  return true;
}

function _replace(list, element, token, newToken) {
  var i = void 0;
  if (!(token = normalize(token)) || !(newToken = normalize(newToken)) || token === newToken || (i = list.indexOf(token)) === -1) {
    return;
  }
  list.splice(i, 1);
  if (list.indexOf(newToken) === -1) {
    list.push(newToken);
  }
  applyList(list, element);
}

function mClassList(element) {
  return !mClassList.ignoreNative && element.classList || function () {
    var list = (element.getAttribute('class') || '').trim().split(/\s+/).filter(function (token) {
      return !!token;
    }),
        ins = {
      length: list.length,
      item: function item(i) {
        return list[i];
      },
      contains: function contains(token) {
        return list.indexOf(normalize(token)) !== -1;
      },
      add: function add() {
        _add(list, element, Array.prototype.slice.call(arguments));
        return mClassList.methodChain ? ins : void 0;
      },
      remove: function remove() {
        _remove(list, element, Array.prototype.slice.call(arguments));
        return mClassList.methodChain ? ins : void 0;
      },

      toggle: function toggle(token, force) {
        return _toggle(list, element, token, force);
      },
      replace: function replace(token, newToken) {
        _replace(list, element, token, newToken);
        return mClassList.methodChain ? ins : void 0;
      }
    };
    return ins;
  }();
}

mClassList.methodChain = true;

/* harmony default export */ __webpack_exports__["default"] = (mClassList);

/***/ }),

/***/ "./src/plain-draggable.js":
/*!********************************!*\
  !*** ./src/plain-draggable.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var cssprefix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cssprefix */ "./node_modules/cssprefix/cssprefix.esm.js");
/* harmony import */ var anim_event__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! anim-event */ "./node_modules/anim-event/anim-event.esm.js");
/* harmony import */ var m_class_list__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! m-class-list */ "./node_modules/m-class-list/m-class-list.esm.js");
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * PlainDraggable
 * https://anseki.github.io/plain-draggable/
 *
 * Copyright (c) 2018 anseki
 * Licensed under the MIT license.
 */




m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"].ignoreNative = true;

var ZINDEX = 9000,

// [SNAP]
SNAP_GRAVITY = 20,
    SNAP_CORNER = 'tl',
    SNAP_SIDE = 'both',
    SNAP_EDGE = 'both',
    SNAP_BASE = 'containment',
    SNAP_ALL_CORNERS = ['tl', 'tr', 'bl', 'br'],
    SNAP_ALL_SIDES = ['start', 'end'],
    SNAP_ALL_EDGES = ['inside', 'outside'],

// [/SNAP]

IS_WEBKIT = !window.chrome && 'WebkitAppearance' in document.documentElement.style,
    IS_GECKO = 'MozAppearance' in document.documentElement.style,
    // [SVG/]

isObject = function () {
  var toString = {}.toString,
      fnToString = {}.hasOwnProperty.toString,
      objFnString = fnToString.call(Object);
  return function (obj) {
    var proto = void 0,
        constr = void 0;
    return obj && toString.call(obj) === '[object Object]' && (!(proto = Object.getPrototypeOf(obj)) || (constr = proto.hasOwnProperty('constructor') && proto.constructor) && typeof constr === 'function' && fnToString.call(constr) === objFnString);
  };
}(),
    isFinite = Number.isFinite || function (value) {
  return typeof value === 'number' && window.isFinite(value);
},


/** @type {Object.<_id: number, props>} */
insProps = {},
    pointerOffset = {};

var insId = 0,
    activeItem = void 0,
    hasMoved = void 0,
    body = void 0,

// CSS property/value
cssValueDraggableCursor = void 0,
    cssValueDraggingCursor = void 0,
    cssOrgValueBodyCursor = void 0,
    cssPropTransitionProperty = void 0,
    cssPropTransform = void 0,
    cssPropUserSelect = void 0,
    cssOrgValueBodyUserSelect = void 0,

// Try to set `cursor` property.
cssWantedValueDraggableCursor = IS_WEBKIT ? ['all-scroll', 'move'] : ['grab', 'all-scroll', 'move'],
    cssWantedValueDraggingCursor = IS_WEBKIT ? 'move' : ['grabbing', 'move'],

// class
draggableClass = 'plain-draggable',
    draggingClass = 'plain-draggable-dragging',
    movingClass = 'plain-draggable-moving';

// Event Controler for mouse and touch interfaces
var pointerEvent = {};
{

  // Gecko, Trident pick drag-event of some elements such as img, a, etc.
  var dragstart = function dragstart(event) {
    event.preventDefault();
  };

  /**
   * @param {Element} element - A target element.
   * @param {number} handlerId - An ID which was returned by regStartHandler.
   * @returns {void}
   */


  /** @type {{clientX, clientY}} */
  var lastPointerXY = { clientX: 0, clientY: 0 },
      startHandlers = {},
      DUPLICATE_INTERVAL = 400; // For avoiding mouse event that fired by touch interface
  var handlerId = 0,
      lastStartTime = 0,
      curPointerClass = void 0,
      curMoveHandler = void 0;

  /**
   * @param {function} startHandler - This is called with pointerXY when it starts. This returns boolean.
   * @returns {number} handlerId which is used for adding/removing to element.
   */
  pointerEvent.regStartHandler = function (startHandler) {
    startHandlers[++handlerId] = function (event) {
      var pointerClass = event.type === 'mousedown' ? 'mouse' : 'touch',
          pointerXY = pointerClass === 'mouse' ? event : event.targetTouches[0] || event.touches[0],
          now = Date.now();
      if (curPointerClass && pointerClass !== curPointerClass && now - lastStartTime < DUPLICATE_INTERVAL) {
        console.log('Event "' + event.type + '" was ignored.'); // [DEBUG/]
        return;
      }
      if (startHandler(pointerXY)) {
        curPointerClass = pointerClass;
        lastPointerXY.clientX = pointerXY.clientX;
        lastPointerXY.clientY = pointerXY.clientY;
        lastStartTime = now;
        event.preventDefault();
      }
    };
    return handlerId;
  };pointerEvent.addStartHandler = function (element, handlerId) {
    element.addEventListener('mousedown', startHandlers[handlerId], false);
    element.addEventListener('touchstart', startHandlers[handlerId], false);
    element.addEventListener('dragstart', dragstart, false);
  };

  /**
   * @param {Element} element - A target element.
   * @param {number} handlerId - An ID which was returned by regStartHandler.
   * @returns {void}
   */
  pointerEvent.removeStartHandler = function (element, handlerId) {
    element.removeEventListener('mousedown', startHandlers[handlerId], false);
    element.removeEventListener('touchstart', startHandlers[handlerId], false);
    element.removeEventListener('dragstart', dragstart, false);
  };

  /**
   * @param {Element} element - A target element.
   * @param {function} moveHandler - This is called with pointerXY when it moves.
   * @returns {void}
   */
  pointerEvent.addMoveHandler = function (element, moveHandler) {
    function pointerMove(event) {
      var pointerClass = event.type === 'mousemove' ? 'mouse' : 'touch',
          pointerXY = pointerClass === 'mouse' ? event : event.targetTouches[0] || event.touches[0];
      if (pointerClass === curPointerClass) {
        moveHandler(pointerXY);
        lastPointerXY.clientX = pointerXY.clientX;
        lastPointerXY.clientY = pointerXY.clientY;
        event.preventDefault();
      }
    }
    element.addEventListener('mousemove', pointerMove, false);
    element.addEventListener('touchmove', pointerMove, false);
    curMoveHandler = moveHandler;
  };

  /**
   * @param {Element} element - A target element.
   * @param {function} endHandler - This is called when it ends.
   * @returns {void}
   */
  pointerEvent.addEndHandler = function (element, endHandler) {
    function pointerEnd(event) {
      var pointerClass = event.type === 'mouseup' ? 'mouse' : 'touch';
      if (pointerClass === curPointerClass) {
        endHandler();
        curPointerClass = null;
        event.preventDefault();
      }
    }
    element.addEventListener('mouseup', pointerEnd, false);
    element.addEventListener('touchend', pointerEnd, false);
    element.addEventListener('touchcancel', pointerEnd, false);
  };

  pointerEvent.callMoveHandler = function () {
    if (curMoveHandler) {
      curMoveHandler(lastPointerXY);
    }
  };
}

// [DEBUG]
window.insProps = insProps;
window.IS_WEBKIT = IS_WEBKIT;
window.IS_GECKO = IS_GECKO; // [SVG/]
// [SNAP]
window.SNAP_GRAVITY = SNAP_GRAVITY;
window.SNAP_CORNER = SNAP_CORNER;
window.SNAP_SIDE = SNAP_SIDE;
window.SNAP_EDGE = SNAP_EDGE;
window.SNAP_BASE = SNAP_BASE;
window.SNAP_ALL_CORNERS = SNAP_ALL_CORNERS;
window.SNAP_ALL_SIDES = SNAP_ALL_SIDES;
window.SNAP_ALL_EDGES = SNAP_ALL_EDGES;
// [/SNAP]
// [/DEBUG]

function copyTree(obj) {
  return !obj ? obj : isObject(obj) ? Object.keys(obj).reduce(function (copyObj, key) {
    copyObj[key] = copyTree(obj[key]);
    return copyObj;
  }, {}) : Array.isArray(obj) ? obj.map(copyTree) : obj;
}

function hasChanged(a, b) {
  var typeA = void 0,
      keysA = void 0;
  return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== (typeof b === 'undefined' ? 'undefined' : _typeof(b)) || (typeA = isObject(a) ? 'obj' : Array.isArray(a) ? 'array' : '') !== (isObject(b) ? 'obj' : Array.isArray(b) ? 'array' : '') || (typeA === 'obj' ? hasChanged(keysA = Object.keys(a).sort(), Object.keys(b).sort()) || keysA.some(function (prop) {
    return hasChanged(a[prop], b[prop]);
  }) : typeA === 'array' ? a.length !== b.length || a.some(function (aVal, i) {
    return hasChanged(aVal, b[i]);
  }) : a !== b);
}

/**
 * @param {Element} element - A target element.
 * @returns {boolean} `true` if connected element.
 */
function isElement(element) {
  return !!(element && element.nodeType === Node.ELEMENT_NODE &&
  // element instanceof HTMLElement &&
  typeof element.getBoundingClientRect === 'function' && !(element.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED));
}
window.isElement = isElement; // [DEBUG/]

/**
 * An object that simulates `DOMRect` to indicate a bounding-box.
 * @typedef {Object} BBox
 * @property {(number|null)} left - document coordinate
 * @property {(number|null)} top - document coordinate
 * @property {(number|null)} right - document coordinate
 * @property {(number|null)} bottom - document coordinate
 * @property {(number|null)} x - Substitutes for left
 * @property {(number|null)} y - Substitutes for top
 * @property {(number|null)} width
 * @property {(number|null)} height
 */

/**
 * @param {Object} bBox - A target object.
 * @returns {(BBox|null)} A normalized `BBox`, or null if `bBox` is invalid.
 */
function validBBox(bBox) {
  if (!isObject(bBox)) {
    return null;
  }
  var value = void 0;
  if (isFinite(value = bBox.left) || isFinite(value = bBox.x)) {
    bBox.left = bBox.x = value;
  } else {
    return null;
  }
  if (isFinite(value = bBox.top) || isFinite(value = bBox.y)) {
    bBox.top = bBox.y = value;
  } else {
    return null;
  }

  if (isFinite(bBox.width) && bBox.width >= 0) {
    bBox.right = bBox.left + bBox.width;
  } else if (isFinite(bBox.right) && bBox.right >= bBox.left) {
    bBox.width = bBox.right - bBox.left;
  } else {
    return null;
  }
  if (isFinite(bBox.height) && bBox.height >= 0) {
    bBox.bottom = bBox.top + bBox.height;
  } else if (isFinite(bBox.bottom) && bBox.bottom >= bBox.top) {
    bBox.height = bBox.bottom - bBox.top;
  } else {
    return null;
  }
  return bBox;
}
window.validBBox = validBBox; // [DEBUG/]

/**
 * A value that is Pixels or Ratio
 * @typedef {{value: number, isRatio: boolean}} PPValue
 */

function validPPValue(value) {

  // Get PPValue from string (all `/s` were already removed)
  function string2PPValue(inString) {
    var matches = /^(.+?)(%)?$/.exec(inString);
    var value = void 0,
        isRatio = void 0;
    return matches && isFinite(value = parseFloat(matches[1])) ? { value: (isRatio = !!(matches[2] && value)) ? value / 100 : value, isRatio: isRatio } : null; // 0% -> 0
  }

  return isFinite(value) ? { value: value, isRatio: false } : typeof value === 'string' ? string2PPValue(value.replace(/\s/g, '')) : null;
}
window.validPPValue = validPPValue; // [DEBUG/]

function ppValue2OptionValue(ppValue) {
  return ppValue.isRatio ? ppValue.value * 100 + '%' : ppValue.value;
}
window.ppValue2OptionValue = ppValue2OptionValue; // [DEBUG/]

function resolvePPValue(ppValue, baseOrigin, baseSize) {
  return typeof ppValue === 'number' ? ppValue : baseOrigin + ppValue.value * (ppValue.isRatio ? baseSize : 1);
}

/**
 * An object that simulates BBox but properties are PPValue.
 * @typedef {Object} PPBBox
 */

/**
 * @param {Object} bBox - A target object.
 * @returns {(PPBBox|null)} A normalized `PPBBox`, or null if `bBox` is invalid.
 */
function validPPBBox(bBox) {
  if (!isObject(bBox)) {
    return null;
  }
  var ppValue = void 0;
  if ((ppValue = validPPValue(bBox.left)) || (ppValue = validPPValue(bBox.x))) {
    bBox.left = bBox.x = ppValue;
  } else {
    return null;
  }
  if ((ppValue = validPPValue(bBox.top)) || (ppValue = validPPValue(bBox.y))) {
    bBox.top = bBox.y = ppValue;
  } else {
    return null;
  }

  if ((ppValue = validPPValue(bBox.width)) && ppValue.value >= 0) {
    bBox.width = ppValue;
    delete bBox.right;
  } else if (ppValue = validPPValue(bBox.right)) {
    bBox.right = ppValue;
    delete bBox.width;
  } else {
    return null;
  }
  if ((ppValue = validPPValue(bBox.height)) && ppValue.value >= 0) {
    bBox.height = ppValue;
    delete bBox.bottom;
  } else if (ppValue = validPPValue(bBox.bottom)) {
    bBox.bottom = ppValue;
    delete bBox.height;
  } else {
    return null;
  }
  return bBox;
}
window.validPPBBox = validPPBBox; // [DEBUG/]

function ppBBox2OptionObject(ppBBox) {
  return Object.keys(ppBBox).reduce(function (obj, prop) {
    obj[prop] = ppValue2OptionValue(ppBBox[prop]);
    return obj;
  }, {});
}
window.ppBBox2OptionObject = ppBBox2OptionObject; // [DEBUG/]

// PPBBox -> BBox
function resolvePPBBox(ppBBox, baseBBox) {
  var prop2Axis = { left: 'x', right: 'x', x: 'x', width: 'x',
    top: 'y', bottom: 'y', y: 'y', height: 'y' },
      baseOriginXY = { x: baseBBox.left, y: baseBBox.top },
      baseSizeXY = { x: baseBBox.width, y: baseBBox.height };
  return validBBox(Object.keys(ppBBox).reduce(function (bBox, prop) {
    bBox[prop] = resolvePPValue(ppBBox[prop], prop === 'width' || prop === 'height' ? 0 : baseOriginXY[prop2Axis[prop]], baseSizeXY[prop2Axis[prop]]);
    return bBox;
  }, {}));
}
window.resolvePPBBox = resolvePPBBox; // [DEBUG/]

/**
 * @param {Element} element - A target element.
 * @param {?boolean} getPaddingBox - Get padding-box instead of border-box as bounding-box.
 * @returns {BBox} A bounding-box of `element`.
 */
function getBBox(element, getPaddingBox) {
  var rect = element.getBoundingClientRect(),
      bBox = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  bBox.left += window.pageXOffset;
  bBox.top += window.pageYOffset;
  if (getPaddingBox) {
    var style = window.getComputedStyle(element, ''),
        borderTop = parseFloat(style.borderTopWidth) || 0,
        borderRight = parseFloat(style.borderRightWidth) || 0,
        borderBottom = parseFloat(style.borderBottomWidth) || 0,
        borderLeft = parseFloat(style.borderLeftWidth) || 0;
    bBox.left += borderLeft;
    bBox.top += borderTop;
    bBox.width -= borderLeft + borderRight;
    bBox.height -= borderTop + borderBottom;
  }
  return validBBox(bBox);
}
window.getBBox = getBBox; // [DEBUG/]

/**
 * Optimize an element for animation.
 * @param {Element} element - A target element.
 * @param {?boolean} gpuTrigger - Initialize for SVGElement if `true`.
 * @returns {Element} A target element.
 */
function initAnim(element, gpuTrigger) {
  var style = element.style;
  style.webkitTapHighlightColor = 'transparent';

  // Only when it has no shadow
  var cssPropBoxShadow = cssprefix__WEBPACK_IMPORTED_MODULE_0__["default"].getName('boxShadow'),
      boxShadow = window.getComputedStyle(element, '')[cssPropBoxShadow];
  if (!boxShadow || boxShadow === 'none') {
    style[cssPropBoxShadow] = '0 0 1px transparent';
  }

  if (gpuTrigger && cssPropTransform) {
    style[cssPropTransform] = 'translateZ(0)';
  }
  return element;
}

function setDraggableCursor(element, orgCursor) {
  if (cssValueDraggableCursor == null) {
    if (cssWantedValueDraggableCursor !== false) {
      cssValueDraggableCursor = cssprefix__WEBPACK_IMPORTED_MODULE_0__["default"].getValue('cursor', cssWantedValueDraggableCursor);
    }
    // The wanted value was denied, or changing is not wanted.
    if (cssValueDraggableCursor == null) {
      cssValueDraggableCursor = false;
    }
  }
  // Update it to change a state even if cssValueDraggableCursor is false.
  element.style.cursor = cssValueDraggableCursor === false ? orgCursor : cssValueDraggableCursor;
}

function setDraggingCursor(element) {
  if (cssValueDraggingCursor == null) {
    if (cssWantedValueDraggingCursor !== false) {
      cssValueDraggingCursor = cssprefix__WEBPACK_IMPORTED_MODULE_0__["default"].getValue('cursor', cssWantedValueDraggingCursor);
    }
    // The wanted value was denied, or changing is not wanted.
    if (cssValueDraggingCursor == null) {
      cssValueDraggingCursor = false;
    }
  }
  if (cssValueDraggingCursor !== false) {
    element.style.cursor = cssValueDraggingCursor;
  }
}

// [SVG]
/**
 * Get SVG coordinates from viewport coordinates.
 * @param {props} props - `props` of instance.
 * @param {number} clientX - viewport X.
 * @param {number} clientY - viewport Y.
 * @returns {SVGPoint} SVG coordinates.
 */
function viewPoint2SvgPoint(props, clientX, clientY) {
  var svgPoint = props.svgPoint;
  svgPoint.x = clientX;
  svgPoint.y = clientY;
  return svgPoint.matrixTransform(props.svgCtmElement.getScreenCTM().inverse());
}
// [/SVG]

/**
 * Move by `translate`.
 * @param {props} props - `props` of instance.
 * @param {{left: number, top: number}} position - New position.
 * @returns {boolean} `true` if it was moved.
 */
function moveTranslate(props, position) {
  var elementBBox = props.elementBBox;
  if (position.left !== elementBBox.left || position.top !== elementBBox.top) {
    var offset = props.htmlOffset;
    props.elementStyle[cssPropTransform] = 'translate(' + (position.left + offset.left) + 'px, ' + (position.top + offset.top) + 'px)';
    return true;
  }
  return false;
}

// [LEFTTOP]
/**
 * Move by `left` and `top`.
 * @param {props} props - `props` of instance.
 * @param {{left: number, top: number}} position - New position.
 * @returns {boolean} `true` if it was moved.
 */
function moveLeftTop(props, position) {
  var elementBBox = props.elementBBox,
      elementStyle = props.elementStyle,
      offset = props.htmlOffset;
  var moved = false;
  if (position.left !== elementBBox.left) {
    elementStyle.left = position.left + offset.left + 'px';
    moved = true;
  }
  if (position.top !== elementBBox.top) {
    elementStyle.top = position.top + offset.top + 'px';
    moved = true;
  }
  return moved;
}
// [/LEFTTOP]

// [SVG]
/**
 * Move SVGElement.
 * @param {props} props - `props` of instance.
 * @param {{left: number, top: number}} position - New position.
 * @returns {boolean} `true` if it was moved.
 */
function moveSvg(props, position) {
  var elementBBox = props.elementBBox;
  if (position.left !== elementBBox.left || position.top !== elementBBox.top) {
    var offset = props.svgOffset,
        originBBox = props.svgOriginBBox,
        point = viewPoint2SvgPoint(props, position.left - window.pageXOffset, position.top - window.pageYOffset);
    props.svgTransform.setTranslate(point.x + offset.x - originBBox.x, point.y + offset.y - originBBox.y);
    return true;
  }
  return false;
}
// [/SVG]

/**
 * Set `props.element` position.
 * @param {props} props - `props` of instance.
 * @param {{left: number, top: number}} position - New position.
 * @param {function} [cbCheck] - Callback that is called with valid position, cancel moving if it returns `false`.
 * @returns {boolean} `true` if it was moved.
 */
function move(props, position, cbCheck) {
  var elementBBox = props.elementBBox;

  function fix() {
    if (props.minLeft >= props.maxLeft) {
      // Disabled
      position.left = elementBBox.left;
    } else if (position.left < props.minLeft) {
      position.left = props.minLeft;
    } else if (position.left > props.maxLeft) {
      position.left = props.maxLeft;
    }
    if (props.minTop >= props.maxTop) {
      // Disabled
      position.top = elementBBox.top;
    } else if (position.top < props.minTop) {
      position.top = props.minTop;
    } else if (position.top > props.maxTop) {
      position.top = props.maxTop;
    }
  }

  fix();
  if (cbCheck) {
    if (cbCheck(position) === false) {
      return false;
    }
    fix(); // Again
  }

  var moved = props.moveElm(props, position);
  if (moved) {
    // Update elementBBox
    props.elementBBox = validBBox({ left: position.left, top: position.top,
      width: elementBBox.width, height: elementBBox.height });
  }
  return moved;
}

/**
 * Initialize HTMLElement for `translate`, and get `offset` that is used by `moveTranslate`.
 * @param {props} props - `props` of instance.
 * @returns {BBox} Current BBox without animation, i.e. left/top properties.
 */
function initTranslate(props) {
  var element = props.element,
      elementStyle = props.elementStyle,
      curPosition = getBBox(element),
      // Get BBox before change style.
  RESTORE_PROPS = ['display', 'marginTop', 'marginBottom', 'width', 'height'];
  RESTORE_PROPS.unshift(cssPropTransform);

  // Reset `transition-property` every time because it might be changed frequently.
  var orgTransitionProperty = elementStyle[cssPropTransitionProperty];
  elementStyle[cssPropTransitionProperty] = 'none'; // Disable animation
  var fixPosition = getBBox(element);

  if (!props.orgStyle) {
    props.orgStyle = RESTORE_PROPS.reduce(function (orgStyle, prop) {
      orgStyle[prop] = elementStyle[prop] || '';
      return orgStyle;
    }, {});
    props.lastStyle = {};
  } else {
    RESTORE_PROPS.forEach(function (prop) {
      // Skip this if it seems user changed it. (it can't check perfectly.)
      if (props.lastStyle[prop] == null || elementStyle[prop] === props.lastStyle[prop]) {
        elementStyle[prop] = props.orgStyle[prop];
      }
    });
  }

  var orgSize = getBBox(element),
      cmpStyle = window.getComputedStyle(element, '');
  // https://www.w3.org/TR/css-transforms-1/#transformable-element
  if (cmpStyle.display === 'inline') {
    elementStyle.display = 'inline-block';
    ['Top', 'Bottom'].forEach(function (dirProp) {
      var padding = parseFloat(cmpStyle['padding' + dirProp]);
      // paddingTop/Bottom make padding but don't make space -> negative margin in inline-block
      // marginTop/Bottom don't work in inline element -> `0` in inline-block
      elementStyle['margin' + dirProp] = padding ? '-' + padding + 'px' : '0';
    });
  }
  elementStyle[cssPropTransform] = 'translate(0, 0)';
  // Get document offset.
  var newBBox = getBBox(element);
  var offset = props.htmlOffset = { left: newBBox.left ? -newBBox.left : 0, top: newBBox.top ? -newBBox.top : 0 }; // avoid `-0`

  // Restore position
  elementStyle[cssPropTransform] = 'translate(' + (curPosition.left + offset.left) + 'px, ' + (curPosition.top + offset.top) + 'px)';
  // Restore size
  ['width', 'height'].forEach(function (prop) {
    if (newBBox[prop] !== orgSize[prop]) {
      // Ignore `box-sizing`
      elementStyle[prop] = orgSize[prop] + 'px';
      newBBox = getBBox(element);
      if (newBBox[prop] !== orgSize[prop]) {
        // Retry
        elementStyle[prop] = orgSize[prop] - (newBBox[prop] - orgSize[prop]) + 'px';
      }
    }
    props.lastStyle[prop] = elementStyle[prop];
  });

  // Restore `transition-property`
  element.offsetWidth; /* force reflow */ // eslint-disable-line no-unused-expressions
  elementStyle[cssPropTransitionProperty] = orgTransitionProperty;
  if (fixPosition.left !== curPosition.left || fixPosition.top !== curPosition.top) {
    // It seems that it is moving.
    elementStyle[cssPropTransform] = 'translate(' + (fixPosition.left + offset.left) + 'px, ' + (fixPosition.top + offset.top) + 'px)';
  }

  return fixPosition;
}

// [LEFTTOP]
/**
 * Initialize HTMLElement for `left` and `top`, and get `offset` that is used by `moveLeftTop`.
 * @param {props} props - `props` of instance.
 * @returns {BBox} Current BBox without animation, i.e. left/top properties.
 */
function initLeftTop(props) {
  var element = props.element,
      elementStyle = props.elementStyle,
      curPosition = getBBox(element),
      // Get BBox before change style.
  RESTORE_PROPS = ['position', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'width', 'height'];

  // Reset `transition-property` every time because it might be changed frequently.
  var orgTransitionProperty = elementStyle[cssPropTransitionProperty];
  elementStyle[cssPropTransitionProperty] = 'none'; // Disable animation
  var fixPosition = getBBox(element);

  if (!props.orgStyle) {
    props.orgStyle = RESTORE_PROPS.reduce(function (orgStyle, prop) {
      orgStyle[prop] = elementStyle[prop] || '';
      return orgStyle;
    }, {});
    props.lastStyle = {};
  } else {
    RESTORE_PROPS.forEach(function (prop) {
      // Skip this if it seems user changed it. (it can't check perfectly.)
      if (props.lastStyle[prop] == null || elementStyle[prop] === props.lastStyle[prop]) {
        elementStyle[prop] = props.orgStyle[prop];
      }
    });
  }

  var orgSize = getBBox(element);
  elementStyle.position = 'absolute';
  elementStyle.left = elementStyle.top = elementStyle.margin = '0';
  // Get document offset.
  var newBBox = getBBox(element);
  var offset = props.htmlOffset = { left: newBBox.left ? -newBBox.left : 0, top: newBBox.top ? -newBBox.top : 0 }; // avoid `-0`

  // Restore position
  elementStyle.left = curPosition.left + offset.left + 'px';
  elementStyle.top = curPosition.top + offset.top + 'px';
  // Restore size
  ['width', 'height'].forEach(function (prop) {
    if (newBBox[prop] !== orgSize[prop]) {
      // Ignore `box-sizing`
      elementStyle[prop] = orgSize[prop] + 'px';
      newBBox = getBBox(element);
      if (newBBox[prop] !== orgSize[prop]) {
        // Retry
        elementStyle[prop] = orgSize[prop] - (newBBox[prop] - orgSize[prop]) + 'px';
      }
    }
    props.lastStyle[prop] = elementStyle[prop];
  });

  // Restore `transition-property`
  element.offsetWidth; /* force reflow */ // eslint-disable-line no-unused-expressions
  elementStyle[cssPropTransitionProperty] = orgTransitionProperty;
  if (fixPosition.left !== curPosition.left || fixPosition.top !== curPosition.top) {
    // It seems that it is moving.
    elementStyle.left = fixPosition.left + offset.left + 'px';
    elementStyle.top = fixPosition.top + offset.top + 'px';
  }

  return fixPosition;
}
// [/LEFTTOP]

// [SVG]
/**
 * Initialize SVGElement, and get `offset` that is used by `moveSvg`.
 * @param {props} props - `props` of instance.
 * @returns {BBox} Current BBox without animation, i.e. left/top properties.
 */
function initSvg(props) {
  var element = props.element,
      svgTransform = props.svgTransform,
      curRect = element.getBoundingClientRect(),
      // Get Rect before change position.
  fixPosition = getBBox(element);

  svgTransform.setTranslate(0, 0);
  var originBBox = props.svgOriginBBox = element.getBBox(),

  // Try to get SVG coordinates of current position.
  newRect = element.getBoundingClientRect(),
      originPoint = viewPoint2SvgPoint(props, newRect.left, newRect.top),

  // Gecko bug, getScreenCTM returns incorrect CTM, and originPoint might not be current position.
  offset = props.svgOffset = { x: originBBox.x - originPoint.x, y: originBBox.y - originPoint.y },


  // Restore position
  curPoint = viewPoint2SvgPoint(props, curRect.left, curRect.top);
  svgTransform.setTranslate(curPoint.x + offset.x - originBBox.x, curPoint.y + offset.y - originBBox.y);

  return fixPosition;
}
// [/SVG]

/**
 * Set `elementBBox`, `containmentBBox`, `min/max``Left/Top` and `snapTargets`.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function initBBox(props) {
  var docBBox = getBBox(document.documentElement),
      elementBBox = props.elementBBox = props.initElm(props),
      // reset offset etc.
  containmentBBox = props.containmentBBox = props.containmentIsBBox ? resolvePPBBox(props.options.containment, docBBox) || docBBox : getBBox(props.options.containment, true);
  props.minLeft = containmentBBox.left;
  props.maxLeft = containmentBBox.right - elementBBox.width;
  props.minTop = containmentBBox.top;
  props.maxTop = containmentBBox.bottom - elementBBox.height;
  // Adjust position
  move(props, { left: elementBBox.left, top: elementBBox.top });

  // [SNAP]

  // Snap-targets

  /**
   * @typedef {Object} SnapTarget
   * @property {number} [x] - A coordinate it moves to. It has x or y or both.
   * @property {number} [y]
   * @property {number} [gravityXStart] - Gravity zone. It has *Start or *End or both, and *X* or *Y* or both.
   * @property {number} [gravityXEnd]
   * @property {number} [gravityYStart]
   * @property {number} [gravityYEnd]
   */

  if (props.parsedSnapTargets) {
    var elementSizeXY = { x: elementBBox.width, y: elementBBox.height },
        minXY = { x: props.minLeft, y: props.minTop },
        maxXY = { x: props.maxLeft, y: props.maxTop },
        prop2Axis = { left: 'x', right: 'x', x: 'x', width: 'x', xStart: 'x', xEnd: 'x', xStep: 'x',
      top: 'y', bottom: 'y', y: 'y', height: 'y', yStart: 'y', yEnd: 'y', yStep: 'y' },
        snapTargets = props.parsedSnapTargets.reduce(function (snapTargets, parsedSnapTarget) {
      var baseRect = parsedSnapTarget.base === 'containment' ? containmentBBox : docBBox,
          baseOriginXY = { x: baseRect.left, y: baseRect.top },
          baseSizeXY = { x: baseRect.width, y: baseRect.height };

      /**
       * Basically, shallow copy from parsedSnapTarget, and it can have resolved values.
       * @typedef {{x: (number|PPValue), y, xStart, xEnd, xStep, yStart, yEnd, yStep}} TargetXY
       * @property {string[]} [corners] - Applied value.
       * @property {string[]} [sides]
       * @property {boolean} center
       * @property {number} [xGravity] - Override parsedSnapTarget.gravity.
       * @property {number} [yGravity]
       */

      // Add single Point or Line (i.e. targetXY has no *Step)
      function addSnapTarget(targetXY) {
        if (targetXY.center == null) {
          targetXY.center = parsedSnapTarget.center;
        }
        if (targetXY.xGravity == null) {
          targetXY.xGravity = parsedSnapTarget.gravity;
        }
        if (targetXY.yGravity == null) {
          targetXY.yGravity = parsedSnapTarget.gravity;
        }

        if (targetXY.x != null && targetXY.y != null) {
          // Point
          targetXY.x = resolvePPValue(targetXY.x, baseOriginXY.x, baseSizeXY.x);
          targetXY.y = resolvePPValue(targetXY.y, baseOriginXY.y, baseSizeXY.y);

          if (targetXY.center) {
            targetXY.x -= elementSizeXY.x / 2;
            targetXY.y -= elementSizeXY.y / 2;
            targetXY.corners = ['tl'];
          }

          (targetXY.corners || parsedSnapTarget.corners).forEach(function (corner) {
            var x = targetXY.x - (corner === 'tr' || corner === 'br' ? elementSizeXY.x : 0),
                y = targetXY.y - (corner === 'bl' || corner === 'br' ? elementSizeXY.y : 0);
            if (x >= minXY.x && x <= maxXY.x && y >= minXY.y && y <= maxXY.y) {
              var snapTarget = { x: x, y: y },
                  gravityXStart = x - targetXY.xGravity,
                  gravityXEnd = x + targetXY.xGravity,
                  gravityYStart = y - targetXY.yGravity,
                  gravityYEnd = y + targetXY.yGravity;
              if (gravityXStart > minXY.x) {
                snapTarget.gravityXStart = gravityXStart;
              }
              if (gravityXEnd < maxXY.x) {
                snapTarget.gravityXEnd = gravityXEnd;
              }
              if (gravityYStart > minXY.y) {
                snapTarget.gravityYStart = gravityYStart;
              }
              if (gravityYEnd < maxXY.y) {
                snapTarget.gravityYEnd = gravityYEnd;
              }
              snapTargets.push(snapTarget);
            }
          });
        } else {
          // Line
          var specAxis = targetXY.x != null ? 'x' : 'y',
              rangeAxis = specAxis === 'x' ? 'y' : 'x',
              startProp = rangeAxis + 'Start',
              endProp = rangeAxis + 'End',
              gravityProp = specAxis + 'Gravity',
              specAxisL = specAxis.toUpperCase(),
              rangeAxisL = rangeAxis.toUpperCase(),
              gravitySpecStartProp = 'gravity' + specAxisL + 'Start',
              gravitySpecEndProp = 'gravity' + specAxisL + 'End',
              gravityRangeStartProp = 'gravity' + rangeAxisL + 'Start',
              gravityRangeEndProp = 'gravity' + rangeAxisL + 'End';
          targetXY[specAxis] = resolvePPValue(targetXY[specAxis], baseOriginXY[specAxis], baseSizeXY[specAxis]);
          targetXY[startProp] = resolvePPValue(targetXY[startProp], baseOriginXY[rangeAxis], baseSizeXY[rangeAxis]);
          targetXY[endProp] = resolvePPValue(targetXY[endProp], baseOriginXY[rangeAxis], baseSizeXY[rangeAxis]) - elementSizeXY[rangeAxis]; // Reduce the end of the line.
          if (targetXY[startProp] > targetXY[endProp] || // Smaller than element size.
          targetXY[startProp] > maxXY[rangeAxis] || targetXY[endProp] < minXY[rangeAxis]) {
            return;
          }

          if (targetXY.center) {
            targetXY[specAxis] -= elementSizeXY[specAxis] / 2;
            targetXY.sides = ['start'];
          }

          (targetXY.sides || parsedSnapTarget.sides).forEach(function (side) {
            var xy = targetXY[specAxis] - (side === 'end' ? elementSizeXY[specAxis] : 0);
            if (xy >= minXY[specAxis] && xy <= maxXY[specAxis]) {
              var snapTarget = {},
                  gravitySpecStart = xy - targetXY[gravityProp],
                  gravitySpecEnd = xy + targetXY[gravityProp];
              snapTarget[specAxis] = xy;
              if (gravitySpecStart > minXY[specAxis]) {
                snapTarget[gravitySpecStartProp] = gravitySpecStart;
              }
              if (gravitySpecEnd < maxXY[specAxis]) {
                snapTarget[gravitySpecEndProp] = gravitySpecEnd;
              }
              if (targetXY[startProp] > minXY[rangeAxis]) {
                snapTarget[gravityRangeStartProp] = targetXY[startProp];
              }
              if (targetXY[endProp] < maxXY[rangeAxis]) {
                snapTarget[gravityRangeEndProp] = targetXY[endProp];
              }
              snapTargets.push(snapTarget);
            }
          });
        }
      }

      var bBox = void 0;
      if ((bBox = parsedSnapTarget.element ? getBBox(parsedSnapTarget.element) : null) || // Element
      parsedSnapTarget.ppBBox) {
        if (parsedSnapTarget.ppBBox) {
          bBox = resolvePPBBox(parsedSnapTarget.ppBBox, baseRect);
        } // BBox
        if (bBox) {
          // Drop invalid BBox.
          // Expand into 4 lines.
          parsedSnapTarget.edges.forEach(function (edge) {
            var lengthenX = parsedSnapTarget.gravity,
                lengthenY = parsedSnapTarget.gravity;
            if (edge === 'outside') {
              // Snap it when a part of the element is part of the range.
              lengthenX += elementBBox.width;
              lengthenY += elementBBox.height;
            }
            var xStart = bBox.left - lengthenX,
                xEnd = bBox.right + lengthenX,
                yStart = bBox.top - lengthenY,
                yEnd = bBox.bottom + lengthenY;
            var side = edge === 'inside' ? 'start' : 'end';
            addSnapTarget({ xStart: xStart, xEnd: xEnd, y: bBox.top, sides: [side], center: false }); // Top
            addSnapTarget({ x: bBox.left, yStart: yStart, yEnd: yEnd, sides: [side], center: false }); // Left
            side = edge === 'inside' ? 'end' : 'start';
            addSnapTarget({ xStart: xStart, xEnd: xEnd, y: bBox.bottom, sides: [side], center: false }); // Bottom
            addSnapTarget({ x: bBox.right, yStart: yStart, yEnd: yEnd, sides: [side], center: false }); // Right
          });
        }
      } else {
        var expanded = [['x', 'y', 'xStart', 'xEnd', 'xStep', 'yStart', 'yEnd', 'yStep'].reduce(function (targetXY, prop) {
          if (parsedSnapTarget[prop]) {
            targetXY[prop] = resolvePPValue(parsedSnapTarget[prop], prop === 'xStep' || prop === 'yStep' ? 0 : baseOriginXY[prop2Axis[prop]], baseSizeXY[prop2Axis[prop]]);
          }
          return targetXY;
        }, {})];

        ['x', 'y'].forEach(function (axis) {
          var startProp = axis + 'Start',
              endProp = axis + 'End',
              stepProp = axis + 'Step',
              gravityProp = axis + 'Gravity';
          expanded = expanded.reduce(function (expanded, targetXY) {
            var start = targetXY[startProp],
                end = targetXY[endProp],
                step = targetXY[stepProp];
            if (start != null && end != null && start >= end) {
              return expanded;
            } // start >= end

            if (step != null) {
              if (step < 2) {
                return expanded;
              }
              // step >= 2px -> Expand by step
              var gravity = step / 2; // max
              gravity = parsedSnapTarget.gravity > gravity ? gravity : null;
              for (var curValue = start; curValue <= end; curValue += step) {
                var expandedXY = Object.keys(targetXY).reduce(function (expandedXY, prop) {
                  if (prop !== startProp && prop !== endProp && prop !== stepProp) {
                    expandedXY[prop] = targetXY[prop];
                  }
                  return expandedXY;
                }, {});
                expandedXY[axis] = curValue;
                expandedXY[gravityProp] = gravity;
                expanded.push(expandedXY);
              }
            } else {
              expanded.push(targetXY);
            }
            return expanded;
          }, []);
        });
        expanded.forEach(function (targetXY) {
          addSnapTarget(targetXY);
        });
      }

      return snapTargets;
    }, []);

    props.snapTargets = snapTargets.length ? snapTargets : null;
  }
  // [/SNAP]
  window.initBBoxDone = true; // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function dragEnd(props) {
  setDraggableCursor(props.options.handle, props.orgCursor);
  body.style.cursor = cssOrgValueBodyCursor;

  if (props.options.zIndex !== false) {
    props.elementStyle.zIndex = props.orgZIndex;
  }
  if (cssPropUserSelect) {
    body.style[cssPropUserSelect] = cssOrgValueBodyUserSelect;
  }
  var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(props.element);
  if (movingClass) {
    classList.remove(movingClass);
  }
  if (draggingClass) {
    classList.remove(draggingClass);
  }

  activeItem = null;
  if (props.onDragEnd) {
    props.onDragEnd();
  }
}

/**
 * @param {props} props - `props` of instance.
 * @param {{clientX, clientY}} pointerXY - This might be MouseEvent, Touch of TouchEvent or Object.
 * @returns {boolean} `true` if it started.
 */
function dragStart(props, pointerXY) {
  if (props.disabled) {
    return false;
  }
  if (activeItem) {
    dragEnd(activeItem);
  } // activeItem is normally null by pointerEvent.end.

  setDraggingCursor(props.options.handle);
  body.style.cursor = cssValueDraggingCursor || // If it is `false` or `''`
  window.getComputedStyle(props.options.handle, '').cursor;

  if (props.options.zIndex !== false) {
    props.elementStyle.zIndex = props.options.zIndex;
  }
  if (cssPropUserSelect) {
    body.style[cssPropUserSelect] = 'none';
  }
  if (draggingClass) {
    Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(props.element).add(draggingClass);
  }

  activeItem = props;
  hasMoved = false;
  pointerOffset.left = props.elementBBox.left - (pointerXY.clientX + window.pageXOffset);
  pointerOffset.top = props.elementBBox.top - (pointerXY.clientY + window.pageYOffset);
  return true;
}

/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */
function _setOptions(props, newOptions) {
  var options = props.options;
  var needsInitBBox = void 0;

  // containment
  if (newOptions.containment) {
    var bBox = void 0;
    if (isElement(newOptions.containment)) {
      // Specific element
      if (newOptions.containment !== options.containment) {
        options.containment = newOptions.containment;
        props.containmentIsBBox = false;
        needsInitBBox = true;
      }
    } else if ((bBox = validPPBBox(copyTree(newOptions.containment))) && // bBox
    hasChanged(bBox, options.containment)) {
      options.containment = bBox;
      props.containmentIsBBox = true;
      needsInitBBox = true;
    }
  }

  // [SNAP]

  /**
   * @typedef {Object} SnapOptions
   * @property {SnapTargetOptions[]} targets
   * @property {number} [gravity]
   * @property {string} [corner]
   * @property {string} [side]
   * @property {boolean} [center]
   * @property {string} [edge]
   * @property {string} [base]
   */

  /**
   * @typedef {Object} SnapTargetOptions
   * @property {(number|string)} [x] - pixels | '<n>%' | {start, end} | {step, start, end}
   * @property {(number|string)} [y]
   * @property {(Element|Object)} [boundingBox] - Object has properties that are string or number from PPBBox.
   * @property {number} [gravity]
   * @property {string} [corner]
   * @property {string} [side]
   * @property {boolean} [center]
   * @property {string} [edge]
   * @property {string} [base]
   */

  /**
   * @typedef {Object} ParsedSnapTarget
   * @property {PPValue} [x] - (input: pixels | '<n>%')
   * @property {PPValue} [y]
   * @property {PPValue} [xStart] - (input: {start, end} | {step, start, end})
   * @property {PPValue} [xEnd]
   * @property {PPValue} [xStep] - (input: {step, start, end})
   * @property {PPValue} [yStart]
   * @property {PPValue} [yEnd]
   * @property {PPValue} [yStep]
   * @property {Element} [element]
   * @property {PPBBox} [ppBBox]
   * @property {number} gravity
   * @property {string[]} corners
   * @property {string[]} sides
   * @property {boolean} center
   * @property {string[]} edges
   * @property {string} base
   */

  // Normalize `gravity`, `corner`, `side`, `center`, `edge`, `base`
  function commonSnapOptions(options, newOptions) {
    function cleanString(inString) {
      return typeof inString === 'string' ? inString.replace(/[, ]+/g, ' ').trim().toLowerCase() : null;
    }

    // gravity
    if (isFinite(newOptions.gravity) && newOptions.gravity > 0) {
      options.gravity = newOptions.gravity;
    }
    // corner
    var corner = cleanString(newOptions.corner);
    if (corner) {
      if (corner !== 'all') {
        var added = {},
            corners = corner.split(/\s/).reduce(function (corners, corner) {
          corner = corner.trim().replace(/^(.).*?-(.).*$/, '$1$2');
          if ((corner = corner === 'tl' || corner === 'lt' ? 'tl' : corner === 'tr' || corner === 'rt' ? 'tr' : corner === 'bl' || corner === 'lb' ? 'bl' : corner === 'br' || corner === 'rb' ? 'br' : null) && !added[corner]) {
            corners.push(corner);
            added[corner] = true;
          }
          return corners;
        }, []),
            cornersLen = corners.length;
        corner = !cornersLen ? null : cornersLen === 4 ? 'all' : corners.join(' ');
      }
      if (corner) {
        options.corner = corner;
      }
    }
    // side
    var side = cleanString(newOptions.side);
    if (side) {
      if (side === 'start' || side === 'end' || side === 'both') {
        options.side = side;
      } else if (side === 'start end' || side === 'end start') {
        options.side = 'both';
      }
    }
    // center
    if (typeof newOptions.center === 'boolean') {
      options.center = newOptions.center;
    }
    // edge
    var edge = cleanString(newOptions.edge);
    if (edge) {
      if (edge === 'inside' || edge === 'outside' || edge === 'both') {
        options.edge = edge;
      } else if (edge === 'inside outside' || edge === 'outside inside') {
        options.edge = 'both';
      }
    }
    // base
    var base = typeof newOptions.base === 'string' ? newOptions.base.trim().toLowerCase() : null;
    if (base && (base === 'containment' || base === 'document')) {
      options.base = base;
    }
    return options;
  }
  window.commonSnapOptions = commonSnapOptions; // [DEBUG/]

  // snap
  if (newOptions.snap != null) {
    var newSnapOptions = isObject(newOptions.snap) && newOptions.snap.targets != null ? newOptions.snap : { targets: newOptions.snap },
        snapTargetsOptions = [],
        snapOptions = commonSnapOptions({ targets: snapTargetsOptions }, newSnapOptions);

    // Set default options into top level.
    if (!snapOptions.gravity) {
      snapOptions.gravity = SNAP_GRAVITY;
    }
    if (!snapOptions.corner) {
      snapOptions.corner = SNAP_CORNER;
    }
    if (!snapOptions.side) {
      snapOptions.side = SNAP_SIDE;
    }
    if (typeof snapOptions.center !== 'boolean') {
      snapOptions.center = false;
    }
    if (!snapOptions.edge) {
      snapOptions.edge = SNAP_EDGE;
    }
    if (!snapOptions.base) {
      snapOptions.base = SNAP_BASE;
    }

    var parsedSnapTargets = (Array.isArray(newSnapOptions.targets) ? newSnapOptions.targets : [newSnapOptions.targets]).reduce(function (parsedSnapTargets, target) {
      if (target == null) {
        return parsedSnapTargets;
      }

      var isElementPre = isElement(target),
          // Pre-check direct value
      ppBBoxPre = validPPBBox(copyTree(target)),
          // Pre-check direct value
      newSnapTargetOptions = isElementPre || ppBBoxPre ? { boundingBox: target } : // Direct Element | PPBBox
      isObject(target) && target.start == null && target.end == null && target.step == null ? target : // SnapTargetOptions
      { x: target, y: target },
          // Others, it might be {step, start, end}
      expandedParsedSnapTargets = [],
          snapTargetOptions = {},
          newOptionsBBox = newSnapTargetOptions.boundingBox;
      var ppBBox = void 0;

      if (isElementPre || isElement(newOptionsBBox)) {
        // Element
        expandedParsedSnapTargets.push({ element: newOptionsBBox });
        snapTargetOptions.boundingBox = newOptionsBBox;
      } else if (ppBBox = ppBBoxPre || validPPBBox(copyTree(newOptionsBBox))) {
        // Object -> PPBBox
        expandedParsedSnapTargets.push({ ppBBox: ppBBox });
        snapTargetOptions.boundingBox = ppBBox2OptionObject(ppBBox);
      } else {
        var invalid = void 0; // `true` if valid PPValue was given but the contained value is invalid.
        var parsedXY = ['x', 'y'].reduce(function (parsedXY, axis) {
          var newOptionsXY = newSnapTargetOptions[axis];
          var ppValue = void 0;

          if (ppValue = validPPValue(newOptionsXY)) {
            // pixels | '<n>%'
            parsedXY[axis] = ppValue;
            snapTargetOptions[axis] = ppValue2OptionValue(ppValue);
          } else {
            // {start, end} | {step, start, end}
            var start = void 0,
                end = void 0,
                step = void 0;
            if (isObject(newOptionsXY)) {
              start = validPPValue(newOptionsXY.start);
              end = validPPValue(newOptionsXY.end);
              step = validPPValue(newOptionsXY.step);
              if (start && end && start.isRatio === end.isRatio && start.value >= end.value) {
                // start >= end
                invalid = true;
              }
            }
            start = parsedXY[axis + 'Start'] = start || { value: 0, isRatio: false };
            end = parsedXY[axis + 'End'] = end || { value: 1, isRatio: true };
            snapTargetOptions[axis] = { start: ppValue2OptionValue(start), end: ppValue2OptionValue(end) };
            if (step) {
              if (step.isRatio ? step.value > 0 : step.value >= 2) {
                // step > 0% || step >= 2px
                parsedXY[axis + 'Step'] = step;
                snapTargetOptions[axis].step = ppValue2OptionValue(step);
              } else {
                invalid = true;
              }
            }
          }
          return parsedXY;
        }, {});
        if (invalid) {
          return parsedSnapTargets;
        }

        if (parsedXY.xStart && !parsedXY.xStep && parsedXY.yStart && !parsedXY.yStep) {
          // Expand into 4 lines. This is not BBox, and `edge` is ignored.
          expandedParsedSnapTargets.push({ xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yStart }, // Top
          { xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yEnd }, // Bottom
          { x: parsedXY.xStart, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd }, // Left
          { x: parsedXY.xEnd, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd // Right
          });
        } else {
          expandedParsedSnapTargets.push(parsedXY);
        }
      }

      if (expandedParsedSnapTargets.length) {
        snapTargetsOptions.push(commonSnapOptions(snapTargetOptions, newSnapTargetOptions));
        // Copy common SnapOptions
        var corner = snapTargetOptions.corner || snapOptions.corner,
            side = snapTargetOptions.side || snapOptions.side,
            edge = snapTargetOptions.edge || snapOptions.edge,
            commonOptions = {
          gravity: snapTargetOptions.gravity || snapOptions.gravity,
          base: snapTargetOptions.base || snapOptions.base,
          center: typeof snapTargetOptions.center === 'boolean' ? snapTargetOptions.center : snapOptions.center,
          corners: corner === 'all' ? SNAP_ALL_CORNERS : corner.split(' '), // Split
          sides: side === 'both' ? SNAP_ALL_SIDES : [side], // Split
          edges: edge === 'both' ? SNAP_ALL_EDGES : [edge] // Split
        };
        expandedParsedSnapTargets.forEach(function (parsedSnapTarget) {
          // Set common SnapOptions
          ['gravity', 'corners', 'sides', 'center', 'edges', 'base'].forEach(function (option) {
            parsedSnapTarget[option] = commonOptions[option];
          });
          parsedSnapTargets.push(parsedSnapTarget);
        });
      }
      return parsedSnapTargets;
    }, []);

    if (parsedSnapTargets.length) {
      options.snap = snapOptions; // Update always
      if (hasChanged(parsedSnapTargets, props.parsedSnapTargets)) {
        props.parsedSnapTargets = parsedSnapTargets;
        needsInitBBox = true;
      }
    }
  } else if (newOptions.hasOwnProperty('snap') && props.parsedSnapTargets) {
    options.snap = props.parsedSnapTargets = props.snapTargets = void 0;
  }

  // [/SNAP]

  if (needsInitBBox) {
    initBBox(props);
  }

  // handle
  if (isElement(newOptions.handle) && newOptions.handle !== options.handle) {
    if (options.handle) {
      // Restore
      options.handle.style.cursor = props.orgCursor;
      if (cssPropUserSelect) {
        options.handle.style[cssPropUserSelect] = props.orgUserSelect;
      }
      // pointerEvent remove startHandler
      pointerEvent.removeStartHandler(options.handle, props.pointerEventHandlerId);
    }
    var handle = options.handle = newOptions.handle;
    props.orgCursor = handle.style.cursor;
    setDraggableCursor(handle, props.orgCursor);
    if (cssPropUserSelect) {
      props.orgUserSelect = handle.style[cssPropUserSelect];
      handle.style[cssPropUserSelect] = 'none';
    }
    // pointerEvent add startHandler
    pointerEvent.addStartHandler(handle, props.pointerEventHandlerId);
  }

  // zIndex
  if (isFinite(newOptions.zIndex) || newOptions.zIndex === false) {
    options.zIndex = newOptions.zIndex;
    if (props === activeItem) {
      props.elementStyle.zIndex = options.zIndex === false ? props.orgZIndex : options.zIndex;
    }
  }

  // left/top
  var position = { left: props.elementBBox.left, top: props.elementBBox.top };
  var needsMove = void 0;
  if (isFinite(newOptions.left) && newOptions.left !== position.left) {
    position.left = newOptions.left;
    needsMove = true;
  }
  if (isFinite(newOptions.top) && newOptions.top !== position.top) {
    position.top = newOptions.top;
    needsMove = true;
  }
  if (needsMove) {
    move(props, position);
  }

  // Event listeners
  ['onDrag', 'onMove', 'onMoveStart', 'onDragEnd'].forEach(function (option) {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
      props[option] = options[option].bind(props.ins);
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = props[option] = void 0;
    }
  });
}

var PlainDraggable = function () {
  /**
   * Create a `PlainDraggable` instance.
   * @param {Element} element - Target element.
   * @param {Object} [options] - Options.
   */
  function PlainDraggable(element, options) {
    _classCallCheck(this, PlainDraggable);

    var props = {
      ins: this,
      options: { // Initial options (not default)
        zIndex: ZINDEX // Initial state.
      },
      disabled: false
    };

    Object.defineProperty(this, '_id', { value: ++insId });
    props._id = this._id;
    insProps[this._id] = props;
    props.initArguments = Array.prototype.slice.call(arguments); // [DEBUG/]

    if (!isElement(element) || element === body) {
      throw new Error('This element is not accepted.');
    }
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    var gpuTrigger = true;
    // [SVG]
    var ownerSvg = void 0;
    // SVGElement which is not root view
    if (element instanceof SVGElement && (ownerSvg = element.ownerSVGElement)) {
      // It means `instanceof SVGLocatable` (many browsers don't have SVGLocatable)
      if (!element.getBBox) {
        throw new Error('This element is not accepted. (SVGLocatable)');
      }
      // Trident and Edge bug, SVGSVGElement doesn't have SVGAnimatedTransformList?
      if (!element.transform) {
        throw new Error('This element is not accepted. (SVGAnimatedTransformList)');
      }
      // Trident bug, returned value must be used (That is not given value).
      props.svgTransform = element.transform.baseVal.appendItem(ownerSvg.createSVGTransform());
      props.svgPoint = ownerSvg.createSVGPoint();
      // Gecko bug, view.getScreenCTM returns CTM with root view.
      var svgView = element.nearestViewportElement;
      props.svgCtmElement = !IS_GECKO ? svgView : svgView.appendChild(document.createElementNS(ownerSvg.namespaceURI, 'rect'));
      gpuTrigger = false;
      props.initElm = initSvg;
      props.moveElm = moveSvg;
    } else {
      // [/SVG]
      /* eslint-disable indent */ /* [SVG/] */
      var cssPropWillChange = cssprefix__WEBPACK_IMPORTED_MODULE_0__["default"].getName('willChange');
      if (cssPropWillChange) {
        gpuTrigger = false;
      }

      if (!options.leftTop && cssPropTransform) {
        // translate
        if (cssPropWillChange) {
          element.style[cssPropWillChange] = 'transform';
        }
        props.initElm = initTranslate;
        props.moveElm = moveTranslate;
      } else {
        // left and top
        // [LEFTTOP]
        if (cssPropWillChange) {
          element.style[cssPropWillChange] = 'left, top';
        }
        props.initElm = initLeftTop;
        props.moveElm = moveLeftTop;
        // [/LEFTTOP]
        /* [LEFTTOP/]
        throw new Error('`transform` is not supported.');
        [LEFTTOP/] */
      }
      /* eslint-enable indent */ /* [SVG/] */
    } // [SVG/]

    props.element = initAnim(element, gpuTrigger);
    props.elementStyle = element.style;
    props.orgZIndex = props.elementStyle.zIndex;
    if (draggableClass) {
      Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(element).add(draggableClass);
    }
    // pointerEvent new startHandler
    props.pointerEventHandlerId = pointerEvent.regStartHandler(function (pointerXY) {
      return dragStart(props, pointerXY);
    });

    // Default options
    if (!options.containment) {
      var parent = void 0;
      options.containment = (parent = element.parentNode) && isElement(parent) ? parent : body;
    }
    if (!options.handle) {
      options.handle = element;
    }

    _setOptions(props, options);
  }

  /**
   * @param {Object} options - New options.
   * @returns {PlainDraggable} Current instance itself.
   */


  _createClass(PlainDraggable, [{
    key: 'setOptions',
    value: function setOptions(options) {
      if (isObject(options)) {
        _setOptions(insProps[this._id], options);
      }
      return this;
    }
  }, {
    key: 'position',
    value: function position() {
      initBBox(insProps[this._id]);
      return this;
    }
  }, {
    key: 'disabled',
    get: function get() {
      return insProps[this._id].disabled;
    },
    set: function set(value) {
      var props = insProps[this._id];
      if ((value = !!value) !== props.disabled) {
        props.disabled = value;
        if (props.disabled) {
          if (props === activeItem) {
            dragEnd(props);
          }
          props.options.handle.style.cursor = props.orgCursor;
          if (cssPropUserSelect) {
            props.options.handle.style[cssPropUserSelect] = props.orgUserSelect;
          }
          if (draggableClass) {
            Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(props.element).remove(draggableClass);
          }
        } else {
          setDraggableCursor(props.options.handle, props.orgCursor);
          if (cssPropUserSelect) {
            props.options.handle.style[cssPropUserSelect] = 'none';
          }
          if (draggableClass) {
            Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(props.element).add(draggableClass);
          }
        }
      }
    }
  }, {
    key: 'element',
    get: function get() {
      return insProps[this._id].element;
    }
  }, {
    key: 'rect',
    get: function get() {
      return copyTree(insProps[this._id].elementBBox);
    }
  }, {
    key: 'left',
    get: function get() {
      return insProps[this._id].elementBBox.left;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { left: value });
    }
  }, {
    key: 'top',
    get: function get() {
      return insProps[this._id].elementBBox.top;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { top: value });
    }
  }, {
    key: 'containment',
    get: function get() {
      var props = insProps[this._id];
      return props.containmentIsBBox ? ppBBox2OptionObject(props.options.containment) : props.options.containment;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { containment: value });
    }

    // [SNAP]

  }, {
    key: 'snap',
    get: function get() {
      return copyTree(insProps[this._id].options.snap);
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { snap: value });
    }
    // [/SNAP]

  }, {
    key: 'handle',
    get: function get() {
      return insProps[this._id].options.handle;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { handle: value });
    }
  }, {
    key: 'zIndex',
    get: function get() {
      return insProps[this._id].options.zIndex;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { zIndex: value });
    }
  }, {
    key: 'onDrag',
    get: function get() {
      return insProps[this._id].options.onDrag;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onDrag: value });
    }
  }, {
    key: 'onMove',
    get: function get() {
      return insProps[this._id].options.onMove;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onMove: value });
    }
  }, {
    key: 'onMoveStart',
    get: function get() {
      return insProps[this._id].options.onMoveStart;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onMoveStart: value });
    }
  }, {
    key: 'onDragEnd',
    get: function get() {
      return insProps[this._id].options.onDragEnd;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { onDragEnd: value });
    }
  }], [{
    key: 'draggableCursor',
    get: function get() {
      return cssWantedValueDraggableCursor;
    },
    set: function set(value) {
      if (cssWantedValueDraggableCursor !== value) {
        cssWantedValueDraggableCursor = value;
        cssValueDraggableCursor = null; // Reset
        Object.keys(insProps).forEach(function (id) {
          var props = insProps[id];
          if (props.disabled || props === activeItem && cssValueDraggingCursor !== false) {
            return;
          }
          setDraggableCursor(props.options.handle, props.orgCursor);
          if (props === activeItem) {
            // Since cssValueDraggingCursor is `false`, copy cursor again.
            body.style.cursor = cssOrgValueBodyCursor;
            body.style.cursor = window.getComputedStyle(props.options.handle, '').cursor;
          }
        });
      }
    }
  }, {
    key: 'draggingCursor',
    get: function get() {
      return cssWantedValueDraggingCursor;
    },
    set: function set(value) {
      if (cssWantedValueDraggingCursor !== value) {
        cssWantedValueDraggingCursor = value;
        cssValueDraggingCursor = null; // Reset
        if (activeItem) {
          setDraggingCursor(activeItem.options.handle);
          if (cssValueDraggingCursor === false) {
            setDraggableCursor(activeItem.options.handle, activeItem.orgCursor); // draggableCursor
            body.style.cursor = cssOrgValueBodyCursor;
          }
          body.style.cursor = cssValueDraggingCursor || // If it is `false` or `''`
          window.getComputedStyle(activeItem.options.handle, '').cursor;
        }
      }
    }
  }, {
    key: 'draggableClass',
    get: function get() {
      return draggableClass;
    },
    set: function set(value) {
      value = value ? value + '' : void 0;
      if (value !== draggableClass) {
        Object.keys(insProps).forEach(function (id) {
          var props = insProps[id];
          if (!props.disabled) {
            var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(props.element);
            if (draggableClass) {
              classList.remove(draggableClass);
            }
            if (value) {
              classList.add(value);
            }
          }
        });
        draggableClass = value;
      }
    }
  }, {
    key: 'draggingClass',
    get: function get() {
      return draggingClass;
    },
    set: function set(value) {
      value = value ? value + '' : void 0;
      if (value !== draggingClass) {
        if (activeItem) {
          var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(activeItem.element);
          if (draggingClass) {
            classList.remove(draggingClass);
          }
          if (value) {
            classList.add(value);
          }
        }
        draggingClass = value;
      }
    }
  }, {
    key: 'movingClass',
    get: function get() {
      return movingClass;
    },
    set: function set(value) {
      value = value ? value + '' : void 0;
      if (value !== movingClass) {
        if (activeItem && hasMoved) {
          var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(activeItem.element);
          if (movingClass) {
            classList.remove(movingClass);
          }
          if (value) {
            classList.add(value);
          }
        }
        movingClass = value;
      }
    }
  }]);

  return PlainDraggable;
}();

// pointerEvent add moveHandler


pointerEvent.addMoveHandler(document, anim_event__WEBPACK_IMPORTED_MODULE_1__["default"].add(function (pointerXY) {
  if (activeItem && move(activeItem, {
    left: pointerXY.clientX + window.pageXOffset + pointerOffset.left,
    top: pointerXY.clientY + window.pageYOffset + pointerOffset.top
  },
  // [SNAP]
  activeItem.snapTargets ? function (position) {
    // Snap
    var iLen = activeItem.snapTargets.length;
    var snappedX = false,
        snappedY = false,
        i = void 0;
    for (i = 0; i < iLen && (!snappedX || !snappedY); i++) {
      var snapTarget = activeItem.snapTargets[i];
      if ((snapTarget.gravityXStart == null || position.left >= snapTarget.gravityXStart) && (snapTarget.gravityXEnd == null || position.left <= snapTarget.gravityXEnd) && (snapTarget.gravityYStart == null || position.top >= snapTarget.gravityYStart) && (snapTarget.gravityYEnd == null || position.top <= snapTarget.gravityYEnd)) {
        if (!snappedX && snapTarget.x != null) {
          position.left = snapTarget.x;
          snappedX = true;
          i = -1; // Restart loop
        }
        if (!snappedY && snapTarget.y != null) {
          position.top = snapTarget.y;
          snappedY = true;
          i = -1; // Restart loop
        }
      }
    }
    position.snapped = snappedX || snappedY;
    return activeItem.onDrag ? activeItem.onDrag(position) : true;
  } :
  // [/SNAP]
  activeItem.onDrag)) {

    if (!hasMoved) {
      hasMoved = true;
      if (movingClass) {
        Object(m_class_list__WEBPACK_IMPORTED_MODULE_2__["default"])(activeItem.element).add(movingClass);
      }
      if (activeItem.onMoveStart) {
        activeItem.onMoveStart();
      }
    }
    if (activeItem.onMove) {
      activeItem.onMove();
    }
  }
}));

// pointerEvent add endHandler
pointerEvent.addEndHandler(document, function () {
  if (activeItem) {
    dragEnd(activeItem);
  }
});

{
  var initDoc = function initDoc() {
    cssPropTransitionProperty = cssprefix__WEBPACK_IMPORTED_MODULE_0__["default"].getName('transitionProperty');
    cssPropTransform = cssprefix__WEBPACK_IMPORTED_MODULE_0__["default"].getName('transform');
    cssOrgValueBodyCursor = body.style.cursor;
    if (cssPropUserSelect = cssprefix__WEBPACK_IMPORTED_MODULE_0__["default"].getName('userSelect')) {
      cssOrgValueBodyUserSelect = body.style[cssPropUserSelect];
    }

    // Init active item when layout is changed, and init others later.

    var LAZY_INIT_DELAY = 200;
    var initDoneItems = {},
        lazyInitTimer = void 0;

    function checkInitBBox(props) {
      if (props.initElm) {
        // Easy checking for instance without errors.
        initBBox(props);
      } // eslint-disable-line brace-style
      else {
          console.log('instance may have an error:');console.log(props);
        } // [DEBUG/]
    }

    function initAll() {
      clearTimeout(lazyInitTimer);
      Object.keys(insProps).forEach(function (id) {
        if (!initDoneItems[id]) {
          checkInitBBox(insProps[id]);
        }
      });
      initDoneItems = {};
    }

    var layoutChanging = false; // Multiple calling (parallel) by `requestAnimationFrame`.
    var layoutChange = anim_event__WEBPACK_IMPORTED_MODULE_1__["default"].add(function () {
      if (layoutChanging) {
        console.log('`resize/scroll` event listener is already running.'); // [DEBUG/]
        return;
      }
      layoutChanging = true;

      if (activeItem) {
        checkInitBBox(activeItem);
        pointerEvent.callMoveHandler();
        initDoneItems[activeItem._id] = true;
      }
      clearTimeout(lazyInitTimer);
      lazyInitTimer = setTimeout(initAll, LAZY_INIT_DELAY);

      layoutChanging = false;
    });
    window.addEventListener('resize', layoutChange, true);
    window.addEventListener('scroll', layoutChange, true);
  };

  if (body = document.body) {
    initDoc();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      body = document.body;
      initDoc();
    }, false);
  }
}

/* [SNAP/]
PlainDraggable.limit = true;
[SNAP/] */

/* harmony default export */ __webpack_exports__["default"] = (PlainDraggable);

/***/ })

/******/ })["default"];
//# sourceMappingURL=plain-draggable.js.map