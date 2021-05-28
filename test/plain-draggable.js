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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
 * Copyright (c) 2021 anseki
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
};

var lastFrameTime = Date.now(),
    requestID;

function step() {
  var called, next;

  if (requestID) {
    cancelAnim.call(window, requestID);
    requestID = null;
  }

  tasks.forEach(function (task) {
    var event;

    if (event = task.event) {
      task.event = null; // Clear it before `task.listener()` because that might fire another event.

      task.listener(event);
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
    var task;

    if (indexOfTasks(listener) === -1) {
      tasks.push(task = {
        listener: listener
      });
      return function (event) {
        task.event = event;

        if (!requestID) {
          step();
        }
      };
    }

    return null;
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
 * Copyright (c) 2021 anseki
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
  return "-".concat(prefix, "-");
}),

/**
 * Get sample CSSStyleDeclaration.
 * @returns {CSSStyleDeclaration}
 */
getDeclaration = function () {
  var declaration;
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
  return (// return window.CSS && window.CSS.supports || ((propName, propValue) => {
    // `CSS.supports` doesn't find prefixed property.
    function (propName, propValue) {
      var declaration = getDeclaration(); // In some browsers, `declaration[prop] = value` updates any property.

      propName = propName.replace(/[A-Z]/g, function (str) {
        return "-".concat(str.toLowerCase());
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
  var res;

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
 * Copyright (c) 2021 anseki
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
    var i;

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
  var i;

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

/***/ "./node_modules/pointer-event/pointer-event.esm.js":
/*!*********************************************************!*\
  !*** ./node_modules/pointer-event/pointer-event.esm.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var anim_event__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! anim-event */ "./node_modules/anim-event/anim-event.esm.js");
/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 * PointerEvent
 * https://github.com/anseki/pointer-event
 *
 * Copyright (c) 2021 anseki
 * Licensed under the MIT license.
 */

var MOUSE_EMU_INTERVAL = 400; // Avoid mouse events emulation
// Support options for addEventListener

var passiveSupported = false;

try {
  window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
    get: function get() {
      passiveSupported = true;
    }
  }));
} catch (error) {
  /* ignore */
}
/**
 * addEventListener with specific option.
 * @param {Element} target - An event-target element.
 * @param {string} type - The event type to listen for.
 * @param {function} listener - The EventListener.
 * @param {Object} options - An options object.
 * @returns {void}
 */


function addEventListenerWithOptions(target, type, listener, options) {
  // When `passive` is not supported, consider that the `useCapture` is supported instead of
  // `options` (i.e. options other than the `passive` also are not supported).
  target.addEventListener(type, listener, passiveSupported ? options : options.capture);
}
/**
 * Get Touch instance in list.
 * @param {Touch[]} touches - An Array or TouchList instance.
 * @param {number} id - Touch#identifier
 * @returns {(Touch|null)} - A found Touch instance.
 */


function getTouchById(touches, id) {
  if (touches != null && id != null) {
    for (var i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id) {
        return touches[i];
      }
    }
  }

  return null;
}
/**
 * @param {Object} xy - Something that might have clientX and clientY.
 * @returns {boolean} - `true` if it has valid clientX and clientY.
 */


function hasXY(xy) {
  return xy && typeof xy.clientX === 'number' && typeof xy.clientY === 'number';
} // Gecko, Trident pick drag-event of some elements such as img, a, etc.


function dragstart(event) {
  event.preventDefault();
}

var PointerEvent = /*#__PURE__*/function () {
  /**
   * Create a `PointerEvent` instance.
   * @param {Object} [options] - Options
   */
  function PointerEvent(options) {
    var _this = this;

    _classCallCheck(this, PointerEvent);

    this.startHandlers = {};
    this.lastHandlerId = 0;
    this.curPointerClass = null;
    this.curTouchId = null;
    this.lastPointerXY = {
      clientX: 0,
      clientY: 0
    };
    this.lastTouchTime = 0; // Options

    this.options = {
      // Default
      preventDefault: true,
      stopPropagation: true
    };

    if (options) {
      ['preventDefault', 'stopPropagation'].forEach(function (option) {
        if (typeof options[option] === 'boolean') {
          _this.options[option] = options[option];
        }
      });
    }
  }
  /**
   * @param {function} startHandler - This is called with pointerXY when it starts. This returns boolean.
   * @returns {number} handlerId which is used for adding/removing to element.
   */


  _createClass(PointerEvent, [{
    key: "regStartHandler",
    value: function regStartHandler(startHandler) {
      var that = this;

      that.startHandlers[++that.lastHandlerId] = function (event) {
        var pointerClass = event.type === 'mousedown' ? 'mouse' : 'touch',
            now = Date.now();
        var pointerXY, touchId;

        if (pointerClass === 'touch') {
          that.lastTouchTime = now; // Avoid mouse events emulation

          pointerXY = event.changedTouches[0];
          touchId = event.changedTouches[0].identifier;
        } else {
          // Avoid mouse events emulation
          if (now - that.lastTouchTime < MOUSE_EMU_INTERVAL) {
            return;
          }

          pointerXY = event;
        }

        if (!hasXY(pointerXY)) {
          throw new Error('No clientX/clientY');
        } // It is new one even if those are 'mouse' or ID is same, then cancel current one.


        if (that.curPointerClass) {
          that.cancel();
        }

        if (startHandler.call(that, pointerXY)) {
          that.curPointerClass = pointerClass;
          that.curTouchId = pointerClass === 'touch' ? touchId : null;
          that.lastPointerXY.clientX = pointerXY.clientX;
          that.lastPointerXY.clientY = pointerXY.clientY;

          if (that.options.preventDefault) {
            event.preventDefault();
          }

          if (that.options.stopPropagation) {
            event.stopPropagation();
          }
        }
      };

      return that.lastHandlerId;
    }
    /**
     * @param {number} handlerId - An ID which was returned by regStartHandler.
     * @returns {void}
     */

  }, {
    key: "unregStartHandler",
    value: function unregStartHandler(handlerId) {
      delete this.startHandlers[handlerId];
    }
    /**
     * @param {Element} element - A target element.
     * @param {number} handlerId - An ID which was returned by regStartHandler.
     * @returns {number} handlerId which was passed.
     */

  }, {
    key: "addStartHandler",
    value: function addStartHandler(element, handlerId) {
      if (!this.startHandlers[handlerId]) {
        throw new Error("Invalid handlerId: ".concat(handlerId));
      }

      addEventListenerWithOptions(element, 'mousedown', this.startHandlers[handlerId], {
        capture: false,
        passive: false
      });
      addEventListenerWithOptions(element, 'touchstart', this.startHandlers[handlerId], {
        capture: false,
        passive: false
      });
      addEventListenerWithOptions(element, 'dragstart', dragstart, {
        capture: false,
        passive: false
      });
      return handlerId;
    }
    /**
     * @param {Element} element - A target element.
     * @param {number} handlerId - An ID which was returned by regStartHandler.
     * @returns {number} handlerId which was passed.
     */

  }, {
    key: "removeStartHandler",
    value: function removeStartHandler(element, handlerId) {
      if (!this.startHandlers[handlerId]) {
        throw new Error("Invalid handlerId: ".concat(handlerId));
      }

      element.removeEventListener('mousedown', this.startHandlers[handlerId], false);
      element.removeEventListener('touchstart', this.startHandlers[handlerId], false);
      element.removeEventListener('dragstart', dragstart, false);
      return handlerId;
    }
    /**
     * @param {Element} element - A target element.
     * @param {function} moveHandler - This is called with pointerXY when it moves.
     * @returns {void}
     */

  }, {
    key: "addMoveHandler",
    value: function addMoveHandler(element, moveHandler) {
      var that = this;
      var wrappedHandler = anim_event__WEBPACK_IMPORTED_MODULE_0__["default"].add(function (event) {
        var pointerClass = event.type === 'mousemove' ? 'mouse' : 'touch'; // Avoid mouse events emulation

        if (pointerClass === 'touch') {
          that.lastTouchTime = Date.now();
        }

        if (pointerClass === that.curPointerClass) {
          var pointerXY = pointerClass === 'touch' ? getTouchById(event.changedTouches, that.curTouchId) : event;

          if (hasXY(pointerXY)) {
            if (pointerXY.clientX !== that.lastPointerXY.clientX || pointerXY.clientY !== that.lastPointerXY.clientY) {
              that.move(pointerXY);
            }

            if (that.options.preventDefault) {
              event.preventDefault();
            }

            if (that.options.stopPropagation) {
              event.stopPropagation();
            }
          }
        }
      });
      addEventListenerWithOptions(element, 'mousemove', wrappedHandler, {
        capture: false,
        passive: false
      });
      addEventListenerWithOptions(element, 'touchmove', wrappedHandler, {
        capture: false,
        passive: false
      });
      that.curMoveHandler = moveHandler;
    }
    /**
     * @param {{clientX, clientY}} [pointerXY] - This might be MouseEvent, Touch of TouchEvent or Object.
     * @returns {void}
     */

  }, {
    key: "move",
    value: function move(pointerXY) {
      if (hasXY(pointerXY)) {
        this.lastPointerXY.clientX = pointerXY.clientX;
        this.lastPointerXY.clientY = pointerXY.clientY;
      }

      if (this.curMoveHandler) {
        this.curMoveHandler(this.lastPointerXY);
      }
    }
    /**
     * @param {Element} element - A target element.
     * @param {function} endHandler - This is called with pointerXY when it ends.
     * @returns {void}
     */

  }, {
    key: "addEndHandler",
    value: function addEndHandler(element, endHandler) {
      var that = this;

      function wrappedHandler(event) {
        var pointerClass = event.type === 'mouseup' ? 'mouse' : 'touch'; // Avoid mouse events emulation

        if (pointerClass === 'touch') {
          that.lastTouchTime = Date.now();
        }

        if (pointerClass === that.curPointerClass) {
          var pointerXY = pointerClass === 'touch' ? getTouchById(event.changedTouches, that.curTouchId) || ( // It might have been removed from `touches` even if it is not in `changedTouches`.
          getTouchById(event.touches, that.curTouchId) ? null : {}) : // `{}` means matching
          event;

          if (pointerXY) {
            that.end(pointerXY);

            if (that.options.preventDefault) {
              event.preventDefault();
            }

            if (that.options.stopPropagation) {
              event.stopPropagation();
            }
          }
        }
      }

      addEventListenerWithOptions(element, 'mouseup', wrappedHandler, {
        capture: false,
        passive: false
      });
      addEventListenerWithOptions(element, 'touchend', wrappedHandler, {
        capture: false,
        passive: false
      });
      that.curEndHandler = endHandler;
    }
    /**
     * @param {{clientX, clientY}} [pointerXY] - This might be MouseEvent, Touch of TouchEvent or Object.
     * @returns {void}
     */

  }, {
    key: "end",
    value: function end(pointerXY) {
      if (hasXY(pointerXY)) {
        this.lastPointerXY.clientX = pointerXY.clientX;
        this.lastPointerXY.clientY = pointerXY.clientY;
      }

      if (this.curEndHandler) {
        this.curEndHandler(this.lastPointerXY);
      }

      this.curPointerClass = this.curTouchId = null;
    }
    /**
     * @param {Element} element - A target element.
     * @param {function} cancelHandler - This is called when it cancels.
     * @returns {void}
     */

  }, {
    key: "addCancelHandler",
    value: function addCancelHandler(element, cancelHandler) {
      var that = this;

      function wrappedHandler(event) {
        /*
          Now, this is fired by touchcancel only, but it might be fired even if curPointerClass is mouse.
        */
        // const pointerClass = 'touch';
        that.lastTouchTime = Date.now(); // Avoid mouse events emulation

        if (that.curPointerClass != null) {
          var pointerXY = getTouchById(event.changedTouches, that.curTouchId) || ( // It might have been removed from `touches` even if it is not in `changedTouches`.
          getTouchById(event.touches, that.curTouchId) ? null : {}); // `{}` means matching

          if (pointerXY) {
            that.cancel();
          }
        }
      }

      addEventListenerWithOptions(element, 'touchcancel', wrappedHandler, {
        capture: false,
        passive: false
      });
      that.curCancelHandler = cancelHandler;
    }
    /**
     * @returns {void}
     */

  }, {
    key: "cancel",
    value: function cancel() {
      if (this.curCancelHandler) {
        this.curCancelHandler();
      }

      this.curPointerClass = this.curTouchId = null;
    }
  }], [{
    key: "addEventListenerWithOptions",
    get: function get() {
      return addEventListenerWithOptions;
    }
  }]);

  return PointerEvent;
}();

/* harmony default export */ __webpack_exports__["default"] = (PointerEvent);

/***/ }),

/***/ "./src/plain-draggable.js":
/*!********************************!*\
  !*** ./src/plain-draggable.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var pointer_event__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pointer-event */ "./node_modules/pointer-event/pointer-event.esm.js");
/* harmony import */ var cssprefix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cssprefix */ "./node_modules/cssprefix/cssprefix.esm.js");
/* harmony import */ var anim_event__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! anim-event */ "./node_modules/anim-event/anim-event.esm.js");
/* harmony import */ var m_class_list__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! m-class-list */ "./node_modules/m-class-list/m-class-list.esm.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 * PlainDraggable
 * https://anseki.github.io/plain-draggable/
 *
 * Copyright (c) 2021 anseki
 * Licensed under the MIT license.
 */




m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"].ignoreNative = true;

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
// [AUTO-SCROLL]
AUTOSCROLL_SPEED = [40, 200, 1000],
    AUTOSCROLL_SENSITIVITY = [100, 40, 0],
    // [/AUTO-SCROLL]
IS_EDGE = '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,
    IS_TRIDENT = !IS_EDGE && !!document.uniqueID,
    // Future Edge might support `document.uniqueID`.
IS_GECKO = ('MozAppearance' in document.documentElement.style),
    IS_BLINK = !IS_EDGE && !IS_GECKO && // Edge has `window.chrome`, and future Gecko might have that.
!!window.chrome && !!window.CSS,
    IS_WEBKIT = !IS_EDGE && !IS_TRIDENT && !IS_GECKO && !IS_BLINK && // Some engines support `webkit-*` properties.
!window.chrome && 'WebkitAppearance' in document.documentElement.style,
    isObject = function () {
  var toString = {}.toString,
      fnToString = {}.hasOwnProperty.toString,
      objFnString = fnToString.call(Object);
  return function (obj) {
    var proto, constr;
    return obj && toString.call(obj) === '[object Object]' && (!(proto = Object.getPrototypeOf(obj)) || (constr = proto.hasOwnProperty('constructor') && proto.constructor) && typeof constr === 'function' && fnToString.call(constr) === objFnString);
  };
}(),
    isFinite = Number.isFinite || function (value) {
  return typeof value === 'number' && window.isFinite(value);
},

/** @type {Object.<_id: number, props>} */
insProps = {},
    pointerOffset = {},
    pointerEvent = new pointer_event__WEBPACK_IMPORTED_MODULE_0__["default"]();

var insId = 0,
    activeProps,
    hasMoved,
    body,
    // CSS property/value
cssValueDraggableCursor,
    cssValueDraggingCursor,
    cssOrgValueBodyCursor,
    cssPropTransitionProperty,
    cssPropTransform,
    cssPropUserSelect,
    cssOrgValueBodyUserSelect,
    // Try to set `cursor` property.
cssWantedValueDraggableCursor = IS_WEBKIT ? ['all-scroll', 'move'] : ['grab', 'all-scroll', 'move'],
    cssWantedValueDraggingCursor = IS_WEBKIT ? 'move' : ['grabbing', 'move'],
    // class
draggableClass = 'plain-draggable',
    draggingClass = 'plain-draggable-dragging',
    movingClass = 'plain-draggable-moving'; // [AUTO-SCROLL]
// Scroll Animation Controller

var scrollFrame = {},
    MSPF = 1000 / 60,
    // ms/frame (FPS: 60)
requestAnim = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
  return setTimeout(callback, MSPF);
},
    cancelAnim = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || function (requestID) {
  return clearTimeout(requestID);
};

{
  /**
   * @typedef {Object} MoveArgs
   * @property {number} dir - [-1 | 1] minus or plus to position value.
   * @property {number} speed - px/ms
   * @property {number} min - Minimum position value.
   * @property {number} max - Maximum position value.
   * @property {number} [lastFrameTime] - Time of last frame.
   * @property {number} [lastValue] - Strict value of last frame.
   */
  var curXyMoveArgs = {},
      curElement,
      curScrollXY,
      requestID;

  function frameUpdate() {
    var now = Date.now();
    ['x', 'y'].forEach(function (xy) {
      var moveArgs = curXyMoveArgs[xy];

      if (moveArgs) {
        var timeLen = now - moveArgs.lastFrameTime,
            absValue = curScrollXY(curElement, xy),
            curValue = moveArgs.lastValue != null && Math.abs(moveArgs.lastValue - absValue) < 10 // It was not moved manually
        ? moveArgs.lastValue : absValue;

        if (moveArgs.dir === -1 ? curValue > moveArgs.min : curValue < moveArgs.max) {
          var newValue = curValue + moveArgs.speed * timeLen * moveArgs.dir;

          if (newValue < moveArgs.min) {
            newValue = moveArgs.min;
          } else if (newValue > moveArgs.max) {
            newValue = moveArgs.max;
          }

          curScrollXY(curElement, xy, newValue);
          moveArgs.lastValue = newValue;
        }

        moveArgs.lastFrameTime = now;
      }
    });
  }

  function frame() {
    cancelAnim.call(window, requestID);
    frameUpdate();
    requestID = requestAnim.call(window, frame);
  }
  /**
   * @param {Element} element - A target element.
   * @param {{x: ?MoveArgs, y: ?MoveArgs}} xyMoveArgs - MoveArgs for x and y
   * @param {function} scrollXY - (element: Element, xy: string, value: number) => number
   * @returns {void}
   */


  scrollFrame.move = function (element, xyMoveArgs, scrollXY) {
    cancelAnim.call(window, requestID);
    frameUpdate(); // Update current data now because it might be not continuation.
    // Re-use lastValue

    if (curElement === element) {
      if (xyMoveArgs.x && curXyMoveArgs.x) {
        xyMoveArgs.x.lastValue = curXyMoveArgs.x.lastValue;
      }

      if (xyMoveArgs.y && curXyMoveArgs.y) {
        xyMoveArgs.y.lastValue = curXyMoveArgs.y.lastValue;
      }
    }

    curElement = element;
    curXyMoveArgs = xyMoveArgs;
    curScrollXY = scrollXY;
    var now = Date.now();
    ['x', 'y'].forEach(function (xy) {
      var moveArgs = curXyMoveArgs[xy];

      if (moveArgs) {
        moveArgs.lastFrameTime = now;
      }
    });
    requestID = requestAnim.call(window, frame);
  };

  scrollFrame.stop = function () {
    cancelAnim.call(window, requestID);
    frameUpdate();
    curXyMoveArgs = {};
    curElement = null; // Remove reference
  };
}

function scrollXYWindow(element, xy, value) {
  if (value != null) {
    if (xy === 'x') {
      element.scrollTo(value, element.pageYOffset);
    } else {
      element.scrollTo(element.pageXOffset, value);
    }
  }

  return xy === 'x' ? element.pageXOffset : element.pageYOffset;
}

function scrollXYElement(element, xy, value) {
  var prop = xy === 'x' ? 'scrollLeft' : 'scrollTop';

  if (value != null) {
    element[prop] = value;
  }

  return element[prop];
}
/**
 * @typedef {Object} Scrollable
 * @property {number} clientWidth - width of scrollable area.
 * @property {number} clientHeight - height of scrollable area.
 * @property {number} scrollWidth - width of inner content.
 * @property {number} scrollHeight - height of inner content.
 * @property {number} clientX - X of scrollable area, document coordinate.
 * @property {number} clientY - T of scrollable area, document coordinate.
 */

/**
 * @param {Element} element - A target element.
 * @param {boolean} [isWindow] - `true` if element is window.
 * @param {boolean} [dontScroll] - `true` makes it skip scroll that gets scrollWidth/Height.
 * @returns {Scrollable} Information for scroll.
 */


function getScrollable(element, isWindow, dontScroll) {
  var scrollable = {};
  var cmpStyleHtml, cmpStyleBody, cmpStyleElement; // clientWidth/Height

  (function (target) {
    scrollable.clientWidth = target.clientWidth;
    scrollable.clientHeight = target.clientHeight;
  })(isWindow ? document.documentElement : element); // scrollWidth/Height

  /*
    Gecko bug, bottom-padding of element is reduced.
    Blink for Android bug, borders of <html> is rendered but those are not added to scrollW/H.
    Then, move it to max scroll position (sufficiently larger values) forcibly, and get scroll position.
  */


  var maxScrollLeft = 0,
      maxScrollTop = 0;

  if (!dontScroll) {
    var curScrollLeft, curScrollTop;

    if (isWindow) {
      curScrollLeft = scrollXYWindow(element, 'x');
      curScrollTop = scrollXYWindow(element, 'y');
      cmpStyleHtml = getComputedStyle(document.documentElement, '');
      cmpStyleBody = getComputedStyle(document.body, '');
      maxScrollLeft = scrollXYWindow(element, 'x', document.documentElement.scrollWidth + scrollable.clientWidth + // Blink for Android bug, scroll* returns size of smaller body
      ['marginLeft', 'marginRight', 'borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight'].reduce(function (len, prop) {
        return len + (parseFloat(cmpStyleHtml[prop]) || 0) + (parseFloat(cmpStyleBody[prop]) || 0);
      }, 0));
      maxScrollTop = scrollXYWindow(element, 'y', document.documentElement.scrollHeight + scrollable.clientHeight + ['marginTop', 'marginBottom', 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'].reduce(function (len, prop) {
        return len + (parseFloat(cmpStyleHtml[prop]) || 0) + (parseFloat(cmpStyleBody[prop]) || 0);
      }, 0));
      scrollXYWindow(element, 'x', curScrollLeft);
      scrollXYWindow(element, 'y', curScrollTop);
    } else {
      curScrollLeft = scrollXYElement(element, 'x');
      curScrollTop = scrollXYElement(element, 'y');
      cmpStyleElement = getComputedStyle(element, '');
      maxScrollLeft = scrollXYElement(element, 'x', element.scrollWidth + scrollable.clientWidth + // Blink for Android bug, scroll* returns size of smaller body
      ['marginLeft', 'marginRight', 'borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight'].reduce(function (len, prop) {
        return len + (parseFloat(cmpStyleElement[prop]) || 0);
      }, 0));
      maxScrollTop = scrollXYElement(element, 'y', element.scrollHeight + scrollable.clientHeight + ['marginTop', 'marginBottom', 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'].reduce(function (len, prop) {
        return len + (parseFloat(cmpStyleElement[prop]) || 0);
      }, 0));
      scrollXYElement(element, 'x', curScrollLeft);
      scrollXYElement(element, 'y', curScrollTop);
    }
  }

  scrollable.scrollWidth = scrollable.clientWidth + maxScrollLeft;
  scrollable.scrollHeight = scrollable.clientHeight + maxScrollTop; // clientX/Y

  var rect;

  if (isWindow) {
    scrollable.clientX = scrollable.clientY = 0;
  } else {
    // padding-box
    rect = element.getBoundingClientRect();

    if (!cmpStyleElement) {
      cmpStyleElement = getComputedStyle(element, '');
    }

    scrollable.clientX = rect.left + (parseFloat(cmpStyleElement.borderLeftWidth) || 0);
    scrollable.clientY = rect.top + (parseFloat(cmpStyleElement.borderTopWidth) || 0);
  }

  return scrollable;
} // [/AUTO-SCROLL]
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
window.SNAP_ALL_EDGES = SNAP_ALL_EDGES; // [/SNAP]
// [AUTO-SCROLL]

window.AUTOSCROLL_SPEED = AUTOSCROLL_SPEED;
window.AUTOSCROLL_SENSITIVITY = AUTOSCROLL_SENSITIVITY; // [/AUTO-SCROLL]
// [/DEBUG]

function copyTree(obj) {
  return !obj ? obj : isObject(obj) ? Object.keys(obj).reduce(function (copyObj, key) {
    copyObj[key] = copyTree(obj[key]);
    return copyObj;
  }, {}) : Array.isArray(obj) ? obj.map(copyTree) : obj;
}

function hasChanged(a, b) {
  var typeA, keysA;
  return _typeof(a) !== _typeof(b) || (typeA = isObject(a) ? 'obj' : Array.isArray(a) ? 'array' : '') !== (isObject(b) ? 'obj' : Array.isArray(b) ? 'array' : '') || (typeA === 'obj' ? hasChanged(keysA = Object.keys(a).sort(), Object.keys(b).sort()) || keysA.some(function (prop) {
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
  return !!(element && element.nodeType === Node.ELEMENT_NODE && // element instanceof HTMLElement &&
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

  var value;

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
    var value, isRatio;
    return matches && isFinite(value = parseFloat(matches[1])) ? {
      value: (isRatio = !!(matches[2] && value)) ? value / 100 : value,
      isRatio: isRatio
    } : null; // 0% -> 0
  }

  return isFinite(value) ? {
    value: value,
    isRatio: false
  } : typeof value === 'string' ? string2PPValue(value.replace(/\s/g, '')) : null;
}

window.validPPValue = validPPValue; // [DEBUG/]

function ppValue2OptionValue(ppValue) {
  return ppValue.isRatio ? "".concat(ppValue.value * 100, "%") : ppValue.value;
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

  var ppValue;

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
  var prop2Axis = {
    left: 'x',
    right: 'x',
    x: 'x',
    width: 'x',
    top: 'y',
    bottom: 'y',
    y: 'y',
    height: 'y'
  },
      baseOriginXY = {
    x: baseBBox.left,
    y: baseBBox.top
  },
      baseSizeXY = {
    x: baseBBox.width,
    y: baseBBox.height
  };
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
      bBox = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
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
  style.webkitTapHighlightColor = 'transparent'; // Only when it has no shadow

  var cssPropBoxShadow = cssprefix__WEBPACK_IMPORTED_MODULE_1__["default"].getName('boxShadow'),
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
      cssValueDraggableCursor = cssprefix__WEBPACK_IMPORTED_MODULE_1__["default"].getValue('cursor', cssWantedValueDraggableCursor);
    } // The wanted value was denied, or changing is not wanted.


    if (cssValueDraggableCursor == null) {
      cssValueDraggableCursor = false;
    }
  } // Update it to change a state even if cssValueDraggableCursor is false.


  element.style.cursor = cssValueDraggableCursor === false ? orgCursor : cssValueDraggableCursor;
}

function setDraggingCursor(element) {
  if (cssValueDraggingCursor == null) {
    if (cssWantedValueDraggingCursor !== false) {
      cssValueDraggingCursor = cssprefix__WEBPACK_IMPORTED_MODULE_1__["default"].getValue('cursor', cssWantedValueDraggingCursor);
    } // The wanted value was denied, or changing is not wanted.


    if (cssValueDraggingCursor == null) {
      cssValueDraggingCursor = false;
    }
  }

  if (cssValueDraggingCursor !== false) {
    element.style.cursor = cssValueDraggingCursor;
  }
} // [SVG]

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
} // [/SVG]

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
    props.elementStyle[cssPropTransform] = "translate(".concat(position.left + offset.left, "px, ").concat(position.top + offset.top, "px)");
    return true;
  }

  return false;
} // [LEFTTOP]

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
} // [/LEFTTOP]
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
} // [/SVG]

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
    props.elementBBox = validBBox({
      left: position.left,
      top: position.top,
      width: elementBBox.width,
      height: elementBBox.height
    });
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
  RESTORE_PROPS.unshift(cssPropTransform); // Reset `transition-property` every time because it might be changed frequently.

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
      cmpStyle = window.getComputedStyle(element, ''); // https://www.w3.org/TR/css-transforms-1/#transformable-element

  if (cmpStyle.display === 'inline') {
    elementStyle.display = 'inline-block';
    ['Top', 'Bottom'].forEach(function (dirProp) {
      var padding = parseFloat(cmpStyle["padding".concat(dirProp)]); // paddingTop/Bottom make padding but don't make space -> negative margin in inline-block
      // marginTop/Bottom don't work in inline element -> `0` in inline-block

      elementStyle["margin".concat(dirProp)] = padding ? "-".concat(padding, "px") : '0';
    });
  }

  elementStyle[cssPropTransform] = 'translate(0, 0)'; // Get document offset.

  var newBBox = getBBox(element);
  var offset = props.htmlOffset = {
    left: newBBox.left ? -newBBox.left : 0,
    top: newBBox.top ? -newBBox.top : 0
  }; // avoid `-0`
  // Restore position

  elementStyle[cssPropTransform] = "translate(".concat(curPosition.left + offset.left, "px, ").concat(curPosition.top + offset.top, "px)"); // Restore size

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
  }); // Restore `transition-property`

  element.offsetWidth;
  /* force reflow */
  // eslint-disable-line no-unused-expressions

  elementStyle[cssPropTransitionProperty] = orgTransitionProperty;

  if (fixPosition.left !== curPosition.left || fixPosition.top !== curPosition.top) {
    // It seems that it is moving.
    elementStyle[cssPropTransform] = "translate(".concat(fixPosition.left + offset.left, "px, ").concat(fixPosition.top + offset.top, "px)");
  }

  return fixPosition;
} // [LEFTTOP]

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
  RESTORE_PROPS = ['position', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'width', 'height']; // Reset `transition-property` every time because it might be changed frequently.

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
  elementStyle.left = elementStyle.top = elementStyle.margin = '0'; // Get document offset.

  var newBBox = getBBox(element);
  var offset = props.htmlOffset = {
    left: newBBox.left ? -newBBox.left : 0,
    top: newBBox.top ? -newBBox.top : 0
  }; // avoid `-0`
  // Restore position

  elementStyle.left = curPosition.left + offset.left + 'px';
  elementStyle.top = curPosition.top + offset.top + 'px'; // Restore size

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
  }); // Restore `transition-property`

  element.offsetWidth;
  /* force reflow */
  // eslint-disable-line no-unused-expressions

  elementStyle[cssPropTransitionProperty] = orgTransitionProperty;

  if (fixPosition.left !== curPosition.left || fixPosition.top !== curPosition.top) {
    // It seems that it is moving.
    elementStyle.left = fixPosition.left + offset.left + 'px';
    elementStyle.top = fixPosition.top + offset.top + 'px';
  }

  return fixPosition;
} // [/LEFTTOP]
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
  offset = props.svgOffset = {
    x: originBBox.x - originPoint.x,
    y: originBBox.y - originPoint.y
  },
      // Restore position
  curPoint = viewPoint2SvgPoint(props, curRect.left, curRect.top);
  svgTransform.setTranslate(curPoint.x + offset.x - originBBox.x, curPoint.y + offset.y - originBBox.y);
  return fixPosition;
} // [/SVG]

/**
 * Set `elementBBox`, `containmentBBox`, `min/max``Left/Top` and `snapTargets`.
 * @param {props} props - `props` of instance.
 * @param {string} [eventType] - A type of event that kicked this method.
 * @returns {void}
 */


function initBBox(props, eventType) {
  // eslint-disable-line no-unused-vars
  var docBBox = getBBox(document.documentElement),
      elementBBox = props.elementBBox = props.initElm(props),
      // reset offset etc.
  containmentBBox = props.containmentBBox = props.containmentIsBBox ? resolvePPBBox(props.options.containment, docBBox) || docBBox : getBBox(props.options.containment, true);
  props.minLeft = containmentBBox.left;
  props.maxLeft = containmentBBox.right - elementBBox.width;
  props.minTop = containmentBBox.top;
  props.maxTop = containmentBBox.bottom - elementBBox.height; // Adjust position

  move(props, {
    left: elementBBox.left,
    top: elementBBox.top
  }); // [SNAP]
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
    var elementSizeXY = {
      x: elementBBox.width,
      y: elementBBox.height
    },
        minXY = {
      x: props.minLeft,
      y: props.minTop
    },
        maxXY = {
      x: props.maxLeft,
      y: props.maxTop
    },
        prop2Axis = {
      left: 'x',
      right: 'x',
      x: 'x',
      width: 'x',
      xStart: 'x',
      xEnd: 'x',
      xStep: 'x',
      top: 'y',
      bottom: 'y',
      y: 'y',
      height: 'y',
      yStart: 'y',
      yEnd: 'y',
      yStep: 'y'
    },
        snapTargets = props.parsedSnapTargets.reduce(function (snapTargets, parsedSnapTarget) {
      var baseRect = parsedSnapTarget.base === 'containment' ? containmentBBox : docBBox,
          baseOriginXY = {
        x: baseRect.left,
        y: baseRect.top
      },
          baseSizeXY = {
        x: baseRect.width,
        y: baseRect.height
      };
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
              var snapTarget = {
                x: x,
                y: y
              },
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
              startProp = "".concat(rangeAxis, "Start"),
              endProp = "".concat(rangeAxis, "End"),
              gravityProp = "".concat(specAxis, "Gravity"),
              specAxisL = specAxis.toUpperCase(),
              rangeAxisL = rangeAxis.toUpperCase(),
              gravitySpecStartProp = "gravity".concat(specAxisL, "Start"),
              gravitySpecEndProp = "gravity".concat(specAxisL, "End"),
              gravityRangeStartProp = "gravity".concat(rangeAxisL, "Start"),
              gravityRangeEndProp = "gravity".concat(rangeAxisL, "End");
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

      var bBox;

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
            addSnapTarget({
              xStart: xStart,
              xEnd: xEnd,
              y: bBox.top,
              sides: [side],
              center: false
            }); // Top

            addSnapTarget({
              x: bBox.left,
              yStart: yStart,
              yEnd: yEnd,
              sides: [side],
              center: false
            }); // Left

            side = edge === 'inside' ? 'end' : 'start';
            addSnapTarget({
              xStart: xStart,
              xEnd: xEnd,
              y: bBox.bottom,
              sides: [side],
              center: false
            }); // Bottom

            addSnapTarget({
              x: bBox.right,
              yStart: yStart,
              yEnd: yEnd,
              sides: [side],
              center: false
            }); // Right
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
          var startProp = "".concat(axis, "Start"),
              endProp = "".concat(axis, "End"),
              stepProp = "".concat(axis, "Step"),
              gravityProp = "".concat(axis, "Gravity");
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
              } // step >= 2px -> Expand by step


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
  } // [/SNAP]
  // [AUTO-SCROLL]


  var autoScroll = {},
      autoScrollOptions = props.options.autoScroll;

  if (autoScrollOptions) {
    autoScroll.isWindow = autoScrollOptions.target === window;
    autoScroll.target = autoScrollOptions.target;
    var dontScroll = eventType === 'scroll',
        // Avoid duplicated calling
    scrollable = getScrollable(autoScrollOptions.target, autoScroll.isWindow, dontScroll),
        scrollableBBox = validBBox({
      left: scrollable.clientX,
      top: scrollable.clientY,
      width: scrollable.clientWidth,
      height: scrollable.clientHeight
    });
    autoScroll.scrollableBBox = scrollableBBox; // [DEBUG/]

    if (!dontScroll) {
      autoScroll.scrollWidth = scrollable.scrollWidth;
      autoScroll.scrollHeight = scrollable.scrollHeight;
    } else if (props.autoScroll) {
      autoScroll.scrollWidth = props.autoScroll.scrollWidth;
      autoScroll.scrollHeight = props.autoScroll.scrollHeight;
    }

    [['X', 'Width', 'left', 'right'], ['Y', 'Height', 'top', 'bottom']].forEach(function (axis) {
      var xy = axis[0],
          wh = axis[1],
          back = axis[2],
          forward = axis[3],
          maxAbs = (autoScroll["scroll".concat(wh)] || 0) - scrollable["client".concat(wh)],
          min = autoScrollOptions["min".concat(xy)] || 0;
      var max = isFinite(autoScrollOptions["max".concat(xy)]) ? autoScrollOptions["max".concat(xy)] : maxAbs;

      if (min < max && min < maxAbs) {
        if (max > maxAbs) {
          max = maxAbs;
        }

        var lines = [],
            elementSize = elementBBox[wh.toLowerCase()];

        for (var i = autoScrollOptions.sensitivity.length - 1; i >= 0; i--) {
          // near -> far
          var sensitivity = autoScrollOptions.sensitivity[i],
              speed = autoScrollOptions.speed[i]; // back

          lines.push({
            dir: -1,
            speed: speed,
            position: scrollableBBox[back] + sensitivity
          }); // forward

          lines.push({
            dir: 1,
            speed: speed,
            position: scrollableBBox[forward] - sensitivity - elementSize
          });
        }

        autoScroll[xy.toLowerCase()] = {
          min: min,
          max: max,
          lines: lines
        };
      }
    });
  }

  props.autoScroll = autoScroll.x || autoScroll.y ? autoScroll : null; // [/AUTO-SCROLL]

  window.initBBoxDone = true; // [DEBUG/]
}
/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */


function dragEnd(props) {
  scrollFrame.stop(); // [AUTO-SCROLL/]

  setDraggableCursor(props.options.handle, props.orgCursor);
  body.style.cursor = cssOrgValueBodyCursor;

  if (props.options.zIndex !== false) {
    props.elementStyle.zIndex = props.orgZIndex;
  }

  if (cssPropUserSelect) {
    body.style[cssPropUserSelect] = cssOrgValueBodyUserSelect;
  }

  var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(props.element);

  if (movingClass) {
    classList.remove(movingClass);
  }

  if (draggingClass) {
    classList.remove(draggingClass);
  }

  activeProps = null;
  pointerEvent.cancel(); // Reset pointer (activeProps must be null because this calls endHandler)

  if (props.onDragEnd) {
    props.onDragEnd({
      left: props.elementBBox.left,
      top: props.elementBBox.top
    });
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

  if (props.onDragStart && props.onDragStart(pointerXY) === false) {
    return false;
  }

  if (activeProps) {
    dragEnd(activeProps);
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
    Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(props.element).add(draggingClass);
  }

  activeProps = props;
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
  var needsInitBBox; // containment

  if (newOptions.containment) {
    var bBox;

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
  } // [SNAP]

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
    } // gravity


    if (isFinite(newOptions.gravity) && newOptions.gravity > 0) {
      options.gravity = newOptions.gravity;
    } // corner


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
    } // side


    var side = cleanString(newOptions.side);

    if (side) {
      if (side === 'start' || side === 'end' || side === 'both') {
        options.side = side;
      } else if (side === 'start end' || side === 'end start') {
        options.side = 'both';
      }
    } // center


    if (typeof newOptions.center === 'boolean') {
      options.center = newOptions.center;
    } // edge


    var edge = cleanString(newOptions.edge);

    if (edge) {
      if (edge === 'inside' || edge === 'outside' || edge === 'both') {
        options.edge = edge;
      } else if (edge === 'inside outside' || edge === 'outside inside') {
        options.edge = 'both';
      }
    } // base


    var base = typeof newOptions.base === 'string' ? newOptions.base.trim().toLowerCase() : null;

    if (base && (base === 'containment' || base === 'document')) {
      options.base = base;
    }

    return options;
  }

  window.commonSnapOptions = commonSnapOptions; // [DEBUG/]
  // snap

  if (newOptions.snap != null) {
    var newSnapOptions = isObject(newOptions.snap) && newOptions.snap.targets != null ? newOptions.snap : {
      targets: newOptions.snap
    },
        snapTargetsOptions = [],
        snapOptions = commonSnapOptions({
      targets: snapTargetsOptions
    }, newSnapOptions); // Set default options into top level.

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
      newSnapTargetOptions = isElementPre || ppBBoxPre ? {
        boundingBox: target
      } : // Direct Element | PPBBox
      isObject(target) && target.start == null && target.end == null && target.step == null ? target : // SnapTargetOptions
      {
        x: target,
        y: target
      },
          // Others, it might be {step, start, end}
      expandedParsedSnapTargets = [],
          snapTargetOptions = {},
          newOptionsBBox = newSnapTargetOptions.boundingBox;
      var ppBBox;

      if (isElementPre || isElement(newOptionsBBox)) {
        // Element
        expandedParsedSnapTargets.push({
          element: newOptionsBBox
        });
        snapTargetOptions.boundingBox = newOptionsBBox;
      } else if (ppBBox = ppBBoxPre || validPPBBox(copyTree(newOptionsBBox))) {
        // Object -> PPBBox
        expandedParsedSnapTargets.push({
          ppBBox: ppBBox
        });
        snapTargetOptions.boundingBox = ppBBox2OptionObject(ppBBox);
      } else {
        var invalid; // `true` if valid PPValue was given but the contained value is invalid.

        var parsedXY = ['x', 'y'].reduce(function (parsedXY, axis) {
          var newOptionsXY = newSnapTargetOptions[axis];
          var ppValue;

          if (ppValue = validPPValue(newOptionsXY)) {
            // pixels | '<n>%'
            parsedXY[axis] = ppValue;
            snapTargetOptions[axis] = ppValue2OptionValue(ppValue);
          } else {
            // {start, end} | {step, start, end}
            var start, end, step;

            if (isObject(newOptionsXY)) {
              start = validPPValue(newOptionsXY.start);
              end = validPPValue(newOptionsXY.end);
              step = validPPValue(newOptionsXY.step);

              if (start && end && start.isRatio === end.isRatio && start.value >= end.value) {
                // start >= end
                invalid = true;
              }
            }

            start = parsedXY["".concat(axis, "Start")] = start || {
              value: 0,
              isRatio: false
            };
            end = parsedXY["".concat(axis, "End")] = end || {
              value: 1,
              isRatio: true
            };
            snapTargetOptions[axis] = {
              start: ppValue2OptionValue(start),
              end: ppValue2OptionValue(end)
            };

            if (step) {
              if (step.isRatio ? step.value > 0 : step.value >= 2) {
                // step > 0% || step >= 2px
                parsedXY["".concat(axis, "Step")] = step;
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
          expandedParsedSnapTargets.push({
            xStart: parsedXY.xStart,
            xEnd: parsedXY.xEnd,
            y: parsedXY.yStart
          }, // Top
          {
            xStart: parsedXY.xStart,
            xEnd: parsedXY.xEnd,
            y: parsedXY.yEnd
          }, // Bottom
          {
            x: parsedXY.xStart,
            yStart: parsedXY.yStart,
            yEnd: parsedXY.yEnd
          }, // Left
          {
            x: parsedXY.xEnd,
            yStart: parsedXY.yStart,
            yEnd: parsedXY.yEnd
          } // Right
          );
        } else {
          expandedParsedSnapTargets.push(parsedXY);
        }
      }

      if (expandedParsedSnapTargets.length) {
        snapTargetsOptions.push(commonSnapOptions(snapTargetOptions, newSnapTargetOptions)); // Copy common SnapOptions

        var corner = snapTargetOptions.corner || snapOptions.corner,
            side = snapTargetOptions.side || snapOptions.side,
            edge = snapTargetOptions.edge || snapOptions.edge,
            commonOptions = {
          gravity: snapTargetOptions.gravity || snapOptions.gravity,
          base: snapTargetOptions.base || snapOptions.base,
          center: typeof snapTargetOptions.center === 'boolean' ? snapTargetOptions.center : snapOptions.center,
          corners: corner === 'all' ? SNAP_ALL_CORNERS : corner.split(' '),
          // Split
          sides: side === 'both' ? SNAP_ALL_SIDES : [side],
          // Split
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
  } // [/SNAP]
  // [AUTO-SCROLL]

  /**
   * @typedef {Object} AutoScrollOptions
   * @property {(Element|Window)} target
   * @property {Array} speed
   * @property {Array} sensitivity
   * @property {number} [minX]
   * @property {number} [maxX]
   * @property {number} [minY]
   * @property {number} [maxY]
   */
  // autoScroll


  if (newOptions.autoScroll) {
    var newAutoScrollOptions = isObject(newOptions.autoScroll) ? newOptions.autoScroll : {
      target: newOptions.autoScroll === true ? window : newOptions.autoScroll
    },
        autoScrollOptions = {}; // target

    autoScrollOptions.target = isElement(newAutoScrollOptions.target) ? newAutoScrollOptions.target : window; // speed

    autoScrollOptions.speed = [];
    (Array.isArray(newAutoScrollOptions.speed) ? newAutoScrollOptions.speed : [newAutoScrollOptions.speed]).every(function (speed, i) {
      if (i <= 2 && isFinite(speed)) {
        autoScrollOptions.speed[i] = speed;
        return true;
      }

      return false;
    });

    if (!autoScrollOptions.speed.length) {
      autoScrollOptions.speed = AUTOSCROLL_SPEED;
    } // sensitivity


    var newSensitivity = Array.isArray(newAutoScrollOptions.sensitivity) ? newAutoScrollOptions.sensitivity : [newAutoScrollOptions.sensitivity];
    autoScrollOptions.sensitivity = autoScrollOptions.speed.map(function (v, i) {
      return isFinite(newSensitivity[i]) ? newSensitivity[i] : AUTOSCROLL_SENSITIVITY[i];
    }); // min*, max*

    ['X', 'Y'].forEach(function (option) {
      var optionMin = "min".concat(option),
          optionMax = "max".concat(option);

      if (isFinite(newAutoScrollOptions[optionMin]) && newAutoScrollOptions[optionMin] >= 0) {
        autoScrollOptions[optionMin] = newAutoScrollOptions[optionMin];
      }

      if (isFinite(newAutoScrollOptions[optionMax]) && newAutoScrollOptions[optionMax] >= 0 && (!autoScrollOptions[optionMin] || newAutoScrollOptions[optionMax] >= autoScrollOptions[optionMin])) {
        autoScrollOptions[optionMax] = newAutoScrollOptions[optionMax];
      }
    });

    if (hasChanged(autoScrollOptions, options.autoScroll)) {
      options.autoScroll = autoScrollOptions;
      needsInitBBox = true;
    }
  } else if (newOptions.hasOwnProperty('autoScroll')) {
    if (options.autoScroll) {
      needsInitBBox = true;
    }

    options.autoScroll = void 0;
  } // [/AUTO-SCROLL]


  if (needsInitBBox) {
    initBBox(props);
  } // handle


  if (isElement(newOptions.handle) && newOptions.handle !== options.handle) {
    if (options.handle) {
      // Restore
      options.handle.style.cursor = props.orgCursor;

      if (cssPropUserSelect) {
        options.handle.style[cssPropUserSelect] = props.orgUserSelect;
      }

      pointerEvent.removeStartHandler(options.handle, props.pointerEventHandlerId);
    }

    var handle = options.handle = newOptions.handle;
    props.orgCursor = handle.style.cursor;
    setDraggableCursor(handle, props.orgCursor);

    if (cssPropUserSelect) {
      props.orgUserSelect = handle.style[cssPropUserSelect];
      handle.style[cssPropUserSelect] = 'none';
    }

    pointerEvent.addStartHandler(handle, props.pointerEventHandlerId);
  } // zIndex


  if (isFinite(newOptions.zIndex) || newOptions.zIndex === false) {
    options.zIndex = newOptions.zIndex;

    if (props === activeProps) {
      props.elementStyle.zIndex = options.zIndex === false ? props.orgZIndex : options.zIndex;
    }
  } // left/top


  var position = {
    left: props.elementBBox.left,
    top: props.elementBBox.top
  };
  var needsMove;

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
  } // Event listeners


  ['onDrag', 'onMove', 'onDragStart', 'onMoveStart', 'onDragEnd'].forEach(function (option) {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
      props[option] = options[option].bind(props.ins);
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = props[option] = void 0;
    }
  });
}

var PlainDraggable = /*#__PURE__*/function () {
  /**
   * Create a `PlainDraggable` instance.
   * @param {Element} element - Target element.
   * @param {Object} [options] - Options.
   */
  function PlainDraggable(element, options) {
    _classCallCheck(this, PlainDraggable);

    var props = {
      ins: this,
      options: {
        // Initial options (not default)
        zIndex: ZINDEX // Initial state.

      },
      disabled: false
    };
    Object.defineProperty(this, '_id', {
      value: ++insId
    });
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

    var gpuTrigger = true; // [SVG]

    var ownerSvg; // SVGElement which is not root view

    if (element instanceof SVGElement && (ownerSvg = element.ownerSVGElement)) {
      // It means `instanceof SVGLocatable` (many browsers don't have SVGLocatable)
      if (!element.getBBox) {
        throw new Error('This element is not accepted. (SVGLocatable)');
      } // Trident and Edge bug, SVGSVGElement doesn't have SVGAnimatedTransformList?


      if (!element.transform) {
        throw new Error('This element is not accepted. (SVGAnimatedTransformList)');
      } // Trident bug, returned value must be used (That is not given value).


      props.svgTransform = element.transform.baseVal.appendItem(ownerSvg.createSVGTransform());
      props.svgPoint = ownerSvg.createSVGPoint(); // Gecko bug, view.getScreenCTM returns CTM with root view.

      var svgView = element.nearestViewportElement;
      props.svgCtmElement = !IS_GECKO ? svgView : svgView.appendChild(document.createElementNS(ownerSvg.namespaceURI, 'rect'));
      gpuTrigger = false;
      props.initElm = initSvg;
      props.moveElm = moveSvg;
    } else {
      // [/SVG]

      /* eslint-disable indent */

      /* [SVG/] */
      var cssPropWillChange = cssprefix__WEBPACK_IMPORTED_MODULE_1__["default"].getName('willChange');

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
        props.moveElm = moveLeftTop; // [/LEFTTOP]

        /* [LEFTTOP/]
        throw new Error('`transform` is not supported.');
        [LEFTTOP/] */
      }
      /* eslint-enable indent */

      /* [SVG/] */

    } // [SVG/]


    props.element = initAnim(element, gpuTrigger);
    props.elementStyle = element.style;
    props.orgZIndex = props.elementStyle.zIndex;

    if (draggableClass) {
      Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(element).add(draggableClass);
    }

    props.pointerEventHandlerId = pointerEvent.regStartHandler(function (pointerXY) {
      return dragStart(props, pointerXY);
    }); // Default options

    if (!options.containment) {
      var parent;
      options.containment = (parent = element.parentNode) && isElement(parent) ? parent : body;
    }

    if (!options.handle) {
      options.handle = element;
    }

    _setOptions(props, options);
  }

  _createClass(PlainDraggable, [{
    key: "remove",
    value: function remove() {
      var props = insProps[this._id];
      this.disabled = true; // To restore element and reset pointer

      pointerEvent.unregStartHandler(pointerEvent.removeStartHandler(props.options.handle, props.pointerEventHandlerId));
      delete insProps[this._id];
    }
    /**
     * @param {Object} options - New options.
     * @returns {PlainDraggable} Current instance itself.
     */

  }, {
    key: "setOptions",
    value: function setOptions(options) {
      if (isObject(options)) {
        _setOptions(insProps[this._id], options);
      }

      return this;
    }
  }, {
    key: "position",
    value: function position() {
      initBBox(insProps[this._id]);
      return this;
    }
  }, {
    key: "disabled",
    get: function get() {
      return insProps[this._id].disabled;
    },
    set: function set(value) {
      var props = insProps[this._id];

      if ((value = !!value) !== props.disabled) {
        props.disabled = value;

        if (props.disabled) {
          if (props === activeProps) {
            dragEnd(props);
          }

          props.options.handle.style.cursor = props.orgCursor;

          if (cssPropUserSelect) {
            props.options.handle.style[cssPropUserSelect] = props.orgUserSelect;
          }

          if (draggableClass) {
            Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(props.element).remove(draggableClass);
          }
        } else {
          setDraggableCursor(props.options.handle, props.orgCursor);

          if (cssPropUserSelect) {
            props.options.handle.style[cssPropUserSelect] = 'none';
          }

          if (draggableClass) {
            Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(props.element).add(draggableClass);
          }
        }
      }
    }
  }, {
    key: "element",
    get: function get() {
      return insProps[this._id].element;
    }
  }, {
    key: "rect",
    get: function get() {
      return copyTree(insProps[this._id].elementBBox);
    }
  }, {
    key: "left",
    get: function get() {
      return insProps[this._id].elementBBox.left;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        left: value
      });
    }
  }, {
    key: "top",
    get: function get() {
      return insProps[this._id].elementBBox.top;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        top: value
      });
    }
  }, {
    key: "containment",
    get: function get() {
      var props = insProps[this._id];
      return props.containmentIsBBox ? ppBBox2OptionObject(props.options.containment) : props.options.containment;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        containment: value
      });
    } // [SNAP]

  }, {
    key: "snap",
    get: function get() {
      return copyTree(insProps[this._id].options.snap);
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        snap: value
      });
    } // [/SNAP]
    // [AUTO-SCROLL]

  }, {
    key: "autoScroll",
    get: function get() {
      return copyTree(insProps[this._id].options.autoScroll);
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        autoScroll: value
      });
    } // [/AUTO-SCROLL]

  }, {
    key: "handle",
    get: function get() {
      return insProps[this._id].options.handle;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        handle: value
      });
    }
  }, {
    key: "zIndex",
    get: function get() {
      return insProps[this._id].options.zIndex;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        zIndex: value
      });
    }
  }, {
    key: "onDrag",
    get: function get() {
      return insProps[this._id].options.onDrag;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        onDrag: value
      });
    }
  }, {
    key: "onMove",
    get: function get() {
      return insProps[this._id].options.onMove;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        onMove: value
      });
    }
  }, {
    key: "onDragStart",
    get: function get() {
      return insProps[this._id].options.onDragStart;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        onDragStart: value
      });
    }
  }, {
    key: "onMoveStart",
    get: function get() {
      return insProps[this._id].options.onMoveStart;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        onMoveStart: value
      });
    }
  }, {
    key: "onDragEnd",
    get: function get() {
      return insProps[this._id].options.onDragEnd;
    },
    set: function set(value) {
      _setOptions(insProps[this._id], {
        onDragEnd: value
      });
    }
  }], [{
    key: "draggableCursor",
    get: function get() {
      return cssWantedValueDraggableCursor;
    },
    set: function set(value) {
      if (cssWantedValueDraggableCursor !== value) {
        cssWantedValueDraggableCursor = value;
        cssValueDraggableCursor = null; // Reset

        Object.keys(insProps).forEach(function (id) {
          var props = insProps[id];

          if (props.disabled || props === activeProps && cssValueDraggingCursor !== false) {
            return;
          }

          setDraggableCursor(props.options.handle, props.orgCursor);

          if (props === activeProps) {
            // Since cssValueDraggingCursor is `false`, copy cursor again.
            body.style.cursor = cssOrgValueBodyCursor;
            body.style.cursor = window.getComputedStyle(props.options.handle, '').cursor;
          }
        });
      }
    }
  }, {
    key: "draggingCursor",
    get: function get() {
      return cssWantedValueDraggingCursor;
    },
    set: function set(value) {
      if (cssWantedValueDraggingCursor !== value) {
        cssWantedValueDraggingCursor = value;
        cssValueDraggingCursor = null; // Reset

        if (activeProps) {
          setDraggingCursor(activeProps.options.handle);

          if (cssValueDraggingCursor === false) {
            setDraggableCursor(activeProps.options.handle, activeProps.orgCursor); // draggableCursor

            body.style.cursor = cssOrgValueBodyCursor;
          }

          body.style.cursor = cssValueDraggingCursor || // If it is `false` or `''`
          window.getComputedStyle(activeProps.options.handle, '').cursor;
        }
      }
    }
  }, {
    key: "draggableClass",
    get: function get() {
      return draggableClass;
    },
    set: function set(value) {
      value = value ? value + '' : void 0;

      if (value !== draggableClass) {
        Object.keys(insProps).forEach(function (id) {
          var props = insProps[id];

          if (!props.disabled) {
            var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(props.element);

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
    key: "draggingClass",
    get: function get() {
      return draggingClass;
    },
    set: function set(value) {
      value = value ? value + '' : void 0;

      if (value !== draggingClass) {
        if (activeProps) {
          var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(activeProps.element);

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
    key: "movingClass",
    get: function get() {
      return movingClass;
    },
    set: function set(value) {
      value = value ? value + '' : void 0;

      if (value !== movingClass) {
        if (activeProps && hasMoved) {
          var classList = Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(activeProps.element);

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

pointerEvent.addMoveHandler(document, function (pointerXY) {
  if (!activeProps) {
    return;
  }

  var position = {
    left: pointerXY.clientX + window.pageXOffset + pointerOffset.left,
    top: pointerXY.clientY + window.pageYOffset + pointerOffset.top
  };

  if (move(activeProps, position, // [SNAP]
  activeProps.snapTargets ? function (position) {
    // Snap
    var iLen = activeProps.snapTargets.length;
    var snappedX = false,
        snappedY = false,
        i;

    for (i = 0; i < iLen && (!snappedX || !snappedY); i++) {
      var snapTarget = activeProps.snapTargets[i];

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
    return activeProps.onDrag ? activeProps.onDrag(position) : true;
  } : // [/SNAP]
  activeProps.onDrag)) {
    // [AUTO-SCROLL]
    var xyMoveArgs = {},
        autoScroll = activeProps.autoScroll;

    if (autoScroll) {
      var clientXY = {
        x: activeProps.elementBBox.left - window.pageXOffset,
        y: activeProps.elementBBox.top - window.pageYOffset
      };
      ['x', 'y'].forEach(function (axis) {
        if (autoScroll[axis]) {
          var min = autoScroll[axis].min,
              max = autoScroll[axis].max;
          autoScroll[axis].lines.some(function (line) {
            if (line.dir === -1 ? clientXY[axis] <= line.position : clientXY[axis] >= line.position) {
              xyMoveArgs[axis] = {
                dir: line.dir,
                speed: line.speed / 1000,
                min: min,
                max: max
              };
              return true;
            }

            return false;
          });
        }
      });
    }

    if (xyMoveArgs.x || xyMoveArgs.y) {
      scrollFrame.move(autoScroll.target, xyMoveArgs, autoScroll.isWindow ? scrollXYWindow : scrollXYElement);
      position.autoScroll = true;
    } else {
      scrollFrame.stop();
    } // [/AUTO-SCROLL]


    if (!hasMoved) {
      hasMoved = true;

      if (movingClass) {
        Object(m_class_list__WEBPACK_IMPORTED_MODULE_3__["default"])(activeProps.element).add(movingClass);
      }

      if (activeProps.onMoveStart) {
        activeProps.onMoveStart(position);
      }
    }

    if (activeProps.onMove) {
      activeProps.onMove(position);
    }
  }
});
{
  function endHandler() {
    if (activeProps) {
      dragEnd(activeProps);
    }
  }

  pointerEvent.addEndHandler(document, endHandler);
  pointerEvent.addCancelHandler(document, endHandler);
}
{
  function initDoc() {
    cssPropTransitionProperty = cssprefix__WEBPACK_IMPORTED_MODULE_1__["default"].getName('transitionProperty');
    cssPropTransform = cssprefix__WEBPACK_IMPORTED_MODULE_1__["default"].getName('transform');
    cssOrgValueBodyCursor = body.style.cursor;

    if (cssPropUserSelect = cssprefix__WEBPACK_IMPORTED_MODULE_1__["default"].getName('userSelect')) {
      cssOrgValueBodyUserSelect = body.style[cssPropUserSelect];
    } // Init active item when layout is changed, and init others later.


    var LAZY_INIT_DELAY = 200;
    var initDoneItems = {},
        lazyInitTimer;

    function checkInitBBox(props, eventType) {
      if (props.initElm) {
        // Easy checking for instance without errors.
        initBBox(props, eventType);
      } // eslint-disable-line brace-style
      else {
          console.log('instance may have an error:');
          console.log(props);
        } // [DEBUG/]

    }

    function initAll(eventType) {
      clearTimeout(lazyInitTimer);
      Object.keys(insProps).forEach(function (id) {
        if (!initDoneItems[id]) {
          checkInitBBox(insProps[id], eventType);
        }
      });
      initDoneItems = {};
    }

    var layoutChanging = false; // Gecko bug, multiple calling by `resize`.

    var layoutChange = anim_event__WEBPACK_IMPORTED_MODULE_2__["default"].add(function (event) {
      if (layoutChanging) {
        console.log('`resize/scroll` event listener is already running.'); // [DEBUG/]

        return;
      }

      layoutChanging = true;

      if (activeProps) {
        checkInitBBox(activeProps, event.type);
        pointerEvent.move();
        initDoneItems[activeProps._id] = true;
      }

      clearTimeout(lazyInitTimer);
      lazyInitTimer = setTimeout(function () {
        initAll(event.type);
      }, LAZY_INIT_DELAY);
      layoutChanging = false;
    });
    window.addEventListener('resize', layoutChange, true);
    window.addEventListener('scroll', layoutChange, true);
  }

  if (body = document.body) {
    initDoc();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      body = document.body;
      initDoc();
    }, true);
  }
}
/* [SNAP/]
PlainDraggable.limit = true;
[SNAP/] */

/* harmony default export */ __webpack_exports__["default"] = (PlainDraggable);

/***/ })

/******/ })["default"];
//# sourceMappingURL=plain-draggable.js.map