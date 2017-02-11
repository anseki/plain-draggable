var PlainDraggable =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * AnimEvent
 * https://github.com/anseki/anim-event
 *
 * Copyright (c) 2017 anseki
 * Licensed under the MIT license.
 */

// *** Currently, this code except `export` is not ES2015. ***

var MSPF = 1000 / 60,
    // ms/frame (FPS: 60)
KEEP_LOOP = 500,
    requestAnim = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
  setTimeout(callback, MSPF);
},
    cancelAnim = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || function (requestID) {
  clearTimeout(requestID);
},


/**
 * @typedef {Object} task
 * @property {Event} event
 * @property {function} listener
 */

/** @type {task[]} */
tasks = [],
    requestID,
    lastFrameTime = Date.now();

function step() {
  var called, next;

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
   * @returns {(function|null)} - A wrapped event listener.
   */
  add: function add(listener) {
    var task;
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
    var iRemove;
    if ((iRemove = indexOfTasks(listener)) > -1) {
      tasks.splice(iRemove, 1);
      if (!tasks.length && requestID) {
        cancelAnim.call(window, requestID);
        requestID = null;
      }
    }
  }
};

exports.default = AnimEvent;
module.exports = exports["default"];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * CSSPrefix
 * https://github.com/anseki/css-prefix
 *
 * Copyright (c) 2017 anseki
 * Licensed under the MIT license.
 */

// *** Currently, this code except `export` is not ES2015. ***

var CSSPrefix,
    PREFIXES = ['webkit', 'ms', 'moz', 'o'],
    PREFIXES_PROP = [],
    PREFIXES_VALUE = [],
    rePrefixesProp,
    rePrefixesValue,
    props = {},
    values = {}; // cache

function ucf(text) {
  return text.substr(0, 1).toUpperCase() + text.substr(1);
}

PREFIXES.forEach(function (prefix) {
  PREFIXES_PROP.push(prefix);
  PREFIXES_PROP.push(ucf(prefix));
  PREFIXES_VALUE.push('-' + prefix + '-');
});

rePrefixesProp = new RegExp('^(?:' + PREFIXES.join('|') + ')(.)', 'i');
function normalizeProp(prop) {
  var reUc = /[A-Z]/;
  // 'ms' and 'Ms' are found by rePrefixesProp. 'i' option
  return (prop = (prop + '').replace(/-([\da-z])/gi, function (str, p1) {
    // camelCase
    return p1.toUpperCase();
  }).replace(rePrefixesProp, function (str, p1) {
    return reUc.test(p1) ? p1.toLowerCase() : str;
  })).toLowerCase() === 'float' ? 'cssFloat' : prop; // for old CSSOM
}

rePrefixesValue = new RegExp('^(?:' + PREFIXES_VALUE.join('|') + ')', 'i');
function normalizeValue(value) {
  return (value + '').replace(rePrefixesValue, '');
}

function getProp(prop, elm) {
  var style, ucfProp;
  prop = normalizeProp(prop);
  if (props[prop] == null) {
    style = elm.style;

    if (style[prop] != null) {
      // original
      props[prop] = prop;
    } else {
      // try with prefixes
      ucfProp = ucf(prop);
      if (!PREFIXES_PROP.some(function (prefix) {
        var prefixed = prefix + ucfProp;
        if (style[prefixed] != null) {
          props[prop] = prefixed;
          return true;
        }
        return false;
      })) {
        props[prop] = '';
      }
    }
  }
  return props[prop];
}

function setValue(elm, prop, value) {
  var res,
      style = elm.style,
      valueArray = Array.isArray(value) ? value : [value];

  function trySet(prop, value) {
    style[prop] = value;
    return style[prop] === value;
  }

  if (!(prop = getProp(prop, elm))) {
    return '';
  } // Invalid Property
  values[prop] = values[prop] || {};
  if (!valueArray.some(function (value) {
    value = normalizeValue(value);
    if (values[prop][value] == null) {

      if (trySet(prop, value)) {
        // original
        res = values[prop][value] = value;
        return true;
      } else if (PREFIXES_VALUE.some(function (prefix) {
        // try with prefixes
        var prefixed = prefix + value;
        if (trySet(prop, prefixed)) {
          res = values[prop][value] = prefixed;
          return true;
        }
        return false;
      })) {
        return true;
      } else {
        values[prop][value] = '';
        return false; // continue to next value
      }
    } else if (values[prop][value]) {
      style[prop] = res = values[prop][value];
      return true;
    }
    return false;
  })) {
    res = '';
  }
  return res;
}

CSSPrefix = {
  getProp: getProp,
  setValue: setValue
};

exports.default = CSSPrefix;
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                                               * PlainDraggable
                                                                                                                                                                                                                                                                               * https://anseki.github.io/plain-draggable/
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Copyright (c) 2017 anseki
                                                                                                                                                                                                                                                                               * Licensed under the MIT license.
                                                                                                                                                                                                                                                                               */

var _cssprefix = __webpack_require__(1);

var _cssprefix2 = _interopRequireDefault(_cssprefix);

var _animEvent = __webpack_require__(0);

var _animEvent2 = _interopRequireDefault(_animEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ZINDEX = 99999,
    SNAP_GRAVITY = 20,
    SNAP_CORNER = 'tl',
    SNAP_SIDE = 'both',
    SNAP_EDGE = 'both',
    SNAP_BASE = 'containment',
    SNAP_ALL_CORNERS = ['tl', 'tr', 'bl', 'br'],
    SNAP_ALL_SIDES = ['start', 'end'],
    SNAP_ALL_EDGES = ['inside', 'outside'],
    IS_WEBKIT = !window.chrome && 'WebkitAppearance' in document.documentElement.style,
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
insProps = {};

var insId = 0,
    activeItem = void 0,
    hasMoved = void 0,
    pointerOffset = void 0,
    body = void 0,

// CSS property/value
cssValueDraggableCursor = void 0,
    cssValueDraggingCursor = void 0,
    cssOrgValueCursor = void 0,
    cssPropUserSelect = void 0,
    cssOrgValueUserSelect = void 0,

// Try to set `cursor` property.
cssWantedValueDraggableCursor = IS_WEBKIT ? ['all-scroll', 'move'] : ['grab', 'all-scroll', 'move'],
    cssWantedValueDraggingCursor = IS_WEBKIT ? 'move' : ['grabbing', 'move'],

// class
draggableClass = 'plain-draggable',
    movingClass = 'plain-draggable-moving';

// [DEBUG]
window.insProps = insProps;
window.IS_WEBKIT = IS_WEBKIT;
window.SNAP_GRAVITY = SNAP_GRAVITY;
window.SNAP_CORNER = SNAP_CORNER;
window.SNAP_SIDE = SNAP_SIDE;
window.SNAP_EDGE = SNAP_EDGE;
window.SNAP_BASE = SNAP_BASE;
window.SNAP_ALL_CORNERS = SNAP_ALL_CORNERS;
window.SNAP_ALL_SIDES = SNAP_ALL_SIDES;
window.SNAP_ALL_EDGES = SNAP_ALL_EDGES;
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
 * @returns {boolean} - `true` if connected element.
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
 * @returns {(BBox|null)} - A normalized `BBox`, or null if `bBox` is invalid.
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
    var matches = /^(.+?)(\%)?$/.exec(inString);
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
 * @returns {(PPBBox|null)} - A normalized `PPBBox`, or null if `bBox` is invalid.
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
 * @param {boolean} [getPaddingBox] - Get padding-box instead of border-box as bounding-box.
 * @returns {BBox} - A bounding-box of `element`.
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
 * @returns {Element} - A target element.
 */
function initAnim(element) {
  var style = element.style;
  style.webkitTapHighlightColor = 'transparent';
  style[_cssprefix2.default.getProp('transform', element)] = 'translateZ(0)';
  style[_cssprefix2.default.getProp('boxShadow', element)] = '0 0 1px transparent';
  return element;
}

function setDraggableCursor(element) {
  if (cssValueDraggableCursor == null) {
    cssValueDraggableCursor = _cssprefix2.default.setValue(element, 'cursor', cssWantedValueDraggableCursor);
  } else {
    element.style.cursor = cssValueDraggableCursor;
  }
}

function setDraggingCursor(element) {
  if (cssValueDraggingCursor == null) {
    cssValueDraggingCursor = _cssprefix2.default.setValue(element, 'cursor', cssWantedValueDraggingCursor);
  } else {
    element.style.cursor = cssValueDraggingCursor;
  }
}

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

  var elementStyle = props.elementStyle,
      offset = props.offset;
  var moved = false;
  if (position.left !== elementBBox.left) {
    elementStyle.left = position.left + offset.left + 'px';
    moved = true;
  }
  if (position.top !== elementBBox.top) {
    elementStyle.top = position.top + offset.top + 'px';
    moved = true;
  }
  // Update elementBBox
  if (moved) {
    props.elementBBox = validBBox({ left: position.left, top: position.top,
      width: elementBBox.width, height: elementBBox.height });
  }

  return moved;
}

/**
 * Set `elementBBox`, `containmentBBox`, `min/max``Left/Top` and `snapTargets`.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function initBBox(props) {
  var element = props.element,
      elementStyle = props.elementStyle;

  // Get document offset.
  var curPosition = getBBox(element),
      RESTORE_PROPS = ['position', 'margin', 'width', 'height'];
  if (!props.orgStyle) {
    props.orgStyle = RESTORE_PROPS.reduce(function (orgStyle, prop) {
      orgStyle[prop] = elementStyle[prop] || '';
      return orgStyle;
    }, {});
    props.lastStyle = {};
  } else {
    RESTORE_PROPS.forEach(function (prop) {
      // Skip this if it seems user changed it. (Perfect check is impossible.)
      if (props.lastStyle[prop] == null || elementStyle[prop] === props.lastStyle[prop]) {
        elementStyle[prop] = props.orgStyle[prop];
      }
    });
  }
  var orgSize = getBBox(element);
  elementStyle.position = 'absolute';
  elementStyle.left = elementStyle.top = elementStyle.margin = '0';
  var newBBox = getBBox(element);
  var offset = props.offset = { left: newBBox.left ? -newBBox.left : 0, top: newBBox.top ? -newBBox.top : 0 }; // avoid `-0`
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

  var docBBox = getBBox(document.documentElement),
      elementBBox = props.elementBBox = getBBox(element),
      containmentBBox = props.containmentBBox = props.containmentIsBBox ? resolvePPBBox(props.options.containment, docBBox) || docBBox : getBBox(props.options.containment, true),
      minLeft = props.minLeft = containmentBBox.left,
      maxLeft = props.maxLeft = containmentBBox.right - elementBBox.width,
      minTop = props.minTop = containmentBBox.top,
      maxTop = props.maxTop = containmentBBox.bottom - elementBBox.height;
  // Adjust position
  move(props, { left: elementBBox.left, top: elementBBox.top });

  // Snap targets

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
    (function () {
      var elementSizeXY = { x: elementBBox.width, y: elementBBox.height },
          minXY = { x: minLeft, y: minTop },
          maxXY = { x: maxLeft, y: maxTop },
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
            var _ret2 = function () {
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
                return {
                  v: void 0
                };
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
            }();

            if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
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
          (function () {
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
          })();
        }

        return snapTargets;
      }, []);

      props.snapTargets = snapTargets.length ? snapTargets : null;
    })();
  }
  window.initBBoxDone = true; // [DEBUG/]
}

function mousedown(props, event) {
  if (props.disabled) {
    return;
  }

  setDraggingCursor(props.options.handle);
  if (props.options.zIndex !== false) {
    props.elementStyle.zIndex = props.options.zIndex;
  }
  setDraggingCursor(body);
  if (cssPropUserSelect) {
    body.style[cssPropUserSelect] = 'none';
  }

  activeItem = props;
  hasMoved = false;
  pointerOffset = { left: props.elementBBox.left - event.pageX, top: props.elementBBox.top - event.pageY };
}

function dragEnd(props) {
  setDraggableCursor(props.options.handle);
  if (props.options.zIndex !== false) {
    props.elementStyle.zIndex = props.orgZIndex;
  }
  body.style.cursor = cssOrgValueCursor;
  if (cssPropUserSelect) {
    body.style[cssPropUserSelect] = cssOrgValueUserSelect;
  }
  if (movingClass) {
    props.element.classList.remove(movingClass);
  }

  activeItem = null;
  if (props.onDragEnd) {
    props.onDragEnd();
  }
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
   * @property {(Element|Object)} [target] - Properties of Object are string or number from PPBBox.
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
        (function () {
          var added = {},
              corners = corner.split(/\s/).reduce(function (corners, corner) {
            corner = corner.trim().replace(/^(.).*?\-(.).*$/, '$1$2');
            if ((corner = corner === 'tl' || corner === 'lt' ? 'tl' : corner === 'tr' || corner === 'rt' ? 'tr' : corner === 'bl' || corner === 'lb' ? 'bl' : corner === 'br' || corner === 'rb' ? 'br' : null) && !added[corner]) {
              corners.push(corner);
              added[corner] = true;
            }
            return corners;
          }, []),
              cornersLen = corners.length;
          corner = !cornersLen ? null : cornersLen === 4 ? 'all' : corners.join(' ');
        })();
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
    (function () {
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
        newSnapTargetOptions = isElementPre || ppBBoxPre ? { target: target } : // Direct Element | PPBBox
        isObject(target) && target.start == null && target.end == null && target.step == null ? target : // SnapTargetOptions
        { x: target, y: target },
            // Others, it might be {step, start, end}
        expandedParsedSnapTargets = [],
            snapTargetOptions = {},
            newOptionsTarget = newSnapTargetOptions.target;
        var ppBBox = void 0;

        if (isElementPre || isElement(newOptionsTarget)) {
          // Element
          expandedParsedSnapTargets.push({ element: newOptionsTarget });
          snapTargetOptions.target = newOptionsTarget;
        } else if (ppBBox = ppBBoxPre || validPPBBox(copyTree(newOptionsTarget))) {
          // Object -> PPBBox
          expandedParsedSnapTargets.push({ ppBBox: ppBBox });
          snapTargetOptions.target = ppBBox2OptionObject(ppBBox);
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
            { x: parsedXY.xEnd, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd } // Right
            );
          } else {
            expandedParsedSnapTargets.push(parsedXY);
          }
        }

        if (expandedParsedSnapTargets.length) {
          (function () {
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
          })();
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
    })();
  } else if (newOptions.hasOwnProperty('snap') && props.parsedSnapTargets) {
    options.snap = props.parsedSnapTargets = props.snapTargets = void 0;
  }

  if (needsInitBBox) {
    initBBox(props);
  }

  // Gecko, Trident pick drag-event of some elements such as img, a, etc.
  function dragstart(event) {
    event.preventDefault();
  }

  // handle
  if (isElement(newOptions.handle) && newOptions.handle !== options.handle) {
    if (options.handle) {
      // Restore
      options.handle.style.cursor = props.orgCursor;
      options.handle.removeEventListener('dragstart', dragstart, false);
      options.handle.removeEventListener('mousedown', props.handleMousedown, false);
    }
    var handle = options.handle = newOptions.handle;
    props.orgCursor = handle.style.cursor;
    setDraggableCursor(handle);
    handle.addEventListener('dragstart', dragstart, false);
    handle.addEventListener('mousedown', props.handleMousedown, false);
  }

  // zIndex
  if (isFinite(newOptions.zIndex) || newOptions.zIndex === false) {
    options.zIndex = newOptions.zIndex;
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

    if (!isElement(element) || element === body) {
      throw new Error('This element is not accepted.');
    }
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    props.element = initAnim(element);
    props.elementStyle = element.style;
    props.orgZIndex = props.elementStyle.zIndex;
    if (draggableClass) {
      props.element.classList.add(draggableClass);
    }
    // Event listeners for handle element, to be removed.
    props.handleMousedown = function (event) {
      mousedown(props, event);
    };

    // Gecko bug, multiple calling (parallel) by `requestAnimationFrame`.
    props.resizing = false;
    window.addEventListener('resize', _animEvent2.default.add(function () {
      if (props.resizing) {
        console.log('`resize` event listener is already running.'); // [DEBUG/]
        return;
      }
      props.resizing = true;
      initBBox(props);
      props.resizing = false;
    }), true);

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
      value = !!value;
      if (value !== props.disabled) {
        props.disabled = value;
        if (props.disabled) {
          if (props === activeItem) {
            dragEnd(props);
          }
          props.options.handle.style.cursor = props.orgCursor;
          if (draggableClass) {
            props.element.classList.remove(draggableClass);
          }
        } else {
          setDraggableCursor(props.options.handle);
          if (draggableClass) {
            props.element.classList.add(draggableClass);
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
    key: 'bBox',
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
  }, {
    key: 'snap',
    get: function get() {
      return copyTree(insProps[this._id].options.snap);
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { snap: value });
    }
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
      cssWantedValueDraggableCursor = value;
      // Reset
      cssValueDraggableCursor = null;
      Object.keys(insProps).forEach(function (id) {
        var props = insProps[id];
        if (!props.disabled && props !== activeItem) {
          setDraggableCursor(props.options.handle);
        }
      });
    }
  }, {
    key: 'draggingCursor',
    get: function get() {
      return cssWantedValueDraggingCursor;
    },
    set: function set(value) {
      cssWantedValueDraggingCursor = value;
      // Reset
      cssValueDraggingCursor = null;
      if (activeItem) {
        setDraggingCursor(activeItem.options.handle);
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
            if (draggableClass) {
              props.element.classList.remove(draggableClass);
            }
            if (value) {
              props.element.classList.add(value);
            }
          }
        });
        draggableClass = value;
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
          if (movingClass) {
            activeItem.element.classList.remove(movingClass);
          }
          if (value) {
            activeItem.element.classList.add(value);
          }
        }
        movingClass = value;
      }
    }
  }]);

  return PlainDraggable;
}();

document.addEventListener('mousemove', _animEvent2.default.add(function (event) {
  if (activeItem && move(activeItem, {
    left: event.pageX + pointerOffset.left,
    top: event.pageY + pointerOffset.top
  }, activeItem.snapTargets ? function (position) {
    // Snap
    var snappedX = false,
        snappedY = false,
        i = void 0,
        iLen = activeItem.snapTargets.length;
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
  } : activeItem.onDrag)) {

    if (!hasMoved) {
      hasMoved = true;
      if (movingClass) {
        activeItem.element.classList.add(movingClass);
      }
      if (activeItem.onMoveStart) {
        activeItem.onMoveStart();
      }
    }
    if (activeItem.onMove) {
      activeItem.onMove();
    }
  }
}), false);

document.addEventListener('mouseup', function () {
  // It might occur outside body.
  if (activeItem) {
    dragEnd(activeItem);
  }
}, false);

{
  (function () {
    var initBody = function initBody() {
      cssOrgValueCursor = body.style.cursor;
      if (cssPropUserSelect = _cssprefix2.default.getProp('userSelect', body)) {
        cssOrgValueUserSelect = body.style[cssPropUserSelect];
      }
    };

    if (body = document.body) {
      initBody();
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        body = document.body;
        initBody();
      }, false);
    }
  })();
}

exports.default = PlainDraggable;
module.exports = exports['default'];

/***/ })
/******/ ]);
//# sourceMappingURL=plain-draggable.js.map