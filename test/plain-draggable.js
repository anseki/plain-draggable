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
    SNAP_TOLERANCE = 20,
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
cssValueCursorDraggable = void 0,
    cssValueCursorDragging = void 0,
    cssOrgValueCursor = void 0,
    cssPropUserSelect = void 0,
    cssOrgValueUserSelect = void 0,

// Try to set `cursor` property.
cssWantedValueCursorDraggable = IS_WEBKIT ? ['all-scroll', 'move'] : ['grab', 'all-scroll', 'move'],
    cssWantedValueCursorDragging = IS_WEBKIT ? 'move' : ['grabbing', 'move'];

// [DEBUG]
window.insProps = insProps;
window.IS_WEBKIT = IS_WEBKIT;
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
  return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== (typeof b === 'undefined' ? 'undefined' : _typeof(b)) || (typeA = isObject(a) ? 'obj' : Array.isArray(a) ? 'array' : '') !== (isObject(b) ? 'obj' : Array.isArray(b) ? 'array' : '') || (typeA === 'obj' ? hasChanged(keysA = Object.keys(a), Object.keys(b)) || keysA.some(function (prop) {
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

function validBBox(bBox) {
  if (!isObject(bBox)) {
    return null;
  }
  if (isFinite(bBox.left)) {
    bBox.x = bBox.left;
  } else if (isFinite(bBox.x)) {
    bBox.left = bBox.x;
  } else {
    return null;
  }
  if (isFinite(bBox.top)) {
    bBox.y = bBox.top;
  } else if (isFinite(bBox.y)) {
    bBox.top = bBox.y;
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

function setCursorDraggable(element) {
  if (cssValueCursorDraggable == null) {
    cssValueCursorDraggable = _cssprefix2.default.setValue(element, 'cursor', cssWantedValueCursorDraggable);
  } else {
    element.style.cursor = cssValueCursorDraggable;
  }
}

function setCursorDragging(element) {
  if (cssValueCursorDragging == null) {
    cssValueCursorDragging = _cssprefix2.default.setValue(element, 'cursor', cssWantedValueCursorDragging);
  } else {
    element.style.cursor = cssValueCursorDragging;
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
  position.left = props.minLeft >= props.maxLeft ? elementBBox.left : // Disabled
  position.left < props.minLeft ? props.minLeft : position.left > props.maxLeft ? props.maxLeft : position.left;
  position.top = props.minTop >= props.maxTop ? elementBBox.top : // Disabled
  position.top < props.minTop ? props.minTop : position.top > props.maxTop ? props.maxTop : position.top;

  if (cbCheck && cbCheck(position) === false) {
    return false;
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
 * Set `elementBBox`, `containmentBBox` and `min/max``Left/Top`.
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
  } else {
    RESTORE_PROPS.forEach(function (prop) {
      elementStyle[prop] = props.orgStyle[prop];
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
        elementStyle[prop] = orgSize[prop] - (newBBox[prop] - orgSize[prop]) + 'px';
      }
    }
  });

  var elementBBox = props.elementBBox = getBBox(element),
      containmentBBox = props.containmentBBox = props.containmentIsBBox ? props.options.containment : getBBox(props.options.containment, true);
  props.minLeft = containmentBBox.left;
  props.maxLeft = containmentBBox.right - elementBBox.width;
  props.minTop = containmentBBox.top;
  props.maxTop = containmentBBox.bottom - elementBBox.height;
  // Adjust position
  move(props, { left: elementBBox.left, top: elementBBox.top });
  window.initBBoxDone = true; // [DEBUG/]
}

function mousedown(props, event) {
  if (props.disabled) {
    return;
  }

  setCursorDragging(props.options.handle);
  if (props.options.zIndex !== false) {
    props.elementStyle.zIndex = props.options.zIndex;
  }
  setCursorDragging(body);
  if (cssPropUserSelect) {
    body.style[cssPropUserSelect] = 'none';
  }

  activeItem = props;
  hasMoved = false;
  pointerOffset = { left: props.elementBBox.left - event.pageX, top: props.elementBBox.top - event.pageY };
}

function dragEnd(props) {
  setCursorDraggable(props.options.handle);
  if (props.options.zIndex !== false) {
    props.elementStyle.zIndex = props.orgZIndex;
  }
  body.style.cursor = cssOrgValueCursor;
  if (cssPropUserSelect) {
    body.style[cssPropUserSelect] = cssOrgValueUserSelect;
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

  // Gecko, Trident pick drag-event of some elements such as img, a, etc.
  function dragstart(event) {
    event.preventDefault();
  }

  var needsInitBBox = void 0;

  // containment
  if (newOptions.containment) {
    var bBox = void 0;
    if (isObject(newOptions.containment) && (bBox = validBBox(copyTree(newOptions.containment))) && hasChanged(bBox, options.containment)) {
      // bBox
      options.containment = bBox;
      props.containmentIsBBox = true;
      needsInitBBox = true;
    } else if (isElement(newOptions.containment) && newOptions.containment !== options.containment) {
      // Specific element
      options.containment = newOptions.containment;
      props.containmentIsBBox = false;
      needsInitBBox = true;
    }
  }

  // snap
  if (newOptions.snap) {
    (function () {
      // `0` is denied.
      var snap = {},
          inputSnap = isObject(newOptions.snap) ? newOptions.snap : { x: newOptions.snap, y: newOptions.snap };
      ['x', 'y'].forEach(function (axis) {
        var inputAxisOptions = isObject(inputSnap[axis]) ? inputSnap[axis] : { points: inputSnap[axis] };
        if (!inputAxisOptions.points) {
          return;
        } // `0` is denied.

        var points = void 0;
        if (Array.isArray(inputAxisOptions.points)) {
          (function () {
            points = inputAxisOptions.points.filter(function (point) {
              return isFinite(point) && point >= 0;
            });
            points.sort(function (a, b) {
              return a - b;
            });
            var lastPoint = -2;
            points = points.filter(function (point) {
              if (point - lastPoint >= 2) {
                lastPoint = point;
                return true;
              }
              return false;
            });
            if (!points.length) {
              points = null;
            }
          })();
        } else if (isFinite(inputAxisOptions.points) && inputAxisOptions.points >= 2) {
          points = inputAxisOptions.points;
        }

        if (points) {
          var axisOptions = snap[axis] = { points: points };
          // tolerance
          axisOptions.tolerance = isFinite(inputAxisOptions.tolerance) && inputAxisOptions.tolerance > 0 ? inputAxisOptions.tolerance : SNAP_TOLERANCE;
          // edge
          var edge = typeof inputAxisOptions.edge === 'string' ? inputAxisOptions.edge.toLowerCase() : 'both';
          axisOptions.edge = edge === 'start' || edge === 'end' ? edge : 'both';
        }
      });

      if ((snap.x || snap.y) && hasChanged(snap, options.snap)) {
        options.snap = snap;
        needsInitBBox = true;
      }
    })();
  }

  if (needsInitBBox) {
    initBBox(props);
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
    setCursorDraggable(handle);
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
        } else {
          setCursorDraggable(props.options.handle);
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
      return props.containmentIsBBox ? copyTree(props.options.containment) : props.options.containment;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], { containment: value });
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
    key: 'cursorDraggable',
    get: function get() {
      return cssWantedValueCursorDraggable;
    },
    set: function set(value) {
      cssWantedValueCursorDraggable = value;
      // Reset
      cssValueCursorDraggable = null;
      Object.keys(insProps).forEach(function (id) {
        var props = insProps[id];
        if (!props.disabled && props !== activeItem) {
          setCursorDraggable(props.options.handle);
        }
      });
    }
  }, {
    key: 'cursorDragging',
    get: function get() {
      return cssWantedValueCursorDragging;
    },
    set: function set(value) {
      cssWantedValueCursorDragging = value;
      // Reset
      cssValueCursorDragging = null;
      if (activeItem) {
        setCursorDragging(activeItem.options.handle);
      }
    }
  }]);

  return PlainDraggable;
}();

document.addEventListener('mousemove', _animEvent2.default.add(function (event) {
  if (activeItem && move(activeItem, {
    left: event.pageX + pointerOffset.left,
    top: event.pageY + pointerOffset.top
  }, activeItem.onDrag)) {
    if (!hasMoved) {
      hasMoved = true;
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