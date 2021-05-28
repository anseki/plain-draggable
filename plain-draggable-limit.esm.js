/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

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
import PointerEvent from 'pointer-event';
import CSSPrefix from 'cssprefix';
import AnimEvent from 'anim-event';
import mClassList from 'm-class-list';
mClassList.ignoreNative = true;

var ZINDEX = 9000,
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
    pointerEvent = new PointerEvent();

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
    movingClass = 'plain-draggable-moving';

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

function ppValue2OptionValue(ppValue) {
  return ppValue.isRatio ? "".concat(ppValue.value * 100, "%") : ppValue.value;
}

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

function ppBBox2OptionObject(ppBBox) {
  return Object.keys(ppBBox).reduce(function (obj, prop) {
    obj[prop] = ppValue2OptionValue(ppBBox[prop]);
    return obj;
  }, {});
} // PPBBox -> BBox


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
/**
 * Optimize an element for animation.
 * @param {Element} element - A target element.
 * @param {?boolean} gpuTrigger - Initialize for SVGElement if `true`.
 * @returns {Element} A target element.
 */


function initAnim(element, gpuTrigger) {
  var style = element.style;
  style.webkitTapHighlightColor = 'transparent'; // Only when it has no shadow

  var cssPropBoxShadow = CSSPrefix.getName('boxShadow'),
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
      cssValueDraggableCursor = CSSPrefix.getValue('cursor', cssWantedValueDraggableCursor);
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
      cssValueDraggingCursor = CSSPrefix.getValue('cursor', cssWantedValueDraggingCursor);
    } // The wanted value was denied, or changing is not wanted.


    if (cssValueDraggingCursor == null) {
      cssValueDraggingCursor = false;
    }
  }

  if (cssValueDraggingCursor !== false) {
    element.style.cursor = cssValueDraggingCursor;
  }
}
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
}
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
  });
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

  var classList = mClassList(props.element);

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
    mClassList(props.element).add(draggingClass);
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
  }

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

    if (!isElement(element) || element === body) {
      throw new Error('This element is not accepted.');
    }

    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    var gpuTrigger = true;
    var cssPropWillChange = CSSPrefix.getName('willChange');

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
      throw new Error('`transform` is not supported.');
    }

    props.element = initAnim(element, gpuTrigger);
    props.elementStyle = element.style;
    props.orgZIndex = props.elementStyle.zIndex;

    if (draggableClass) {
      mClassList(element).add(draggableClass);
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
            mClassList(props.element).remove(draggableClass);
          }
        } else {
          setDraggableCursor(props.options.handle, props.orgCursor);

          if (cssPropUserSelect) {
            props.options.handle.style[cssPropUserSelect] = 'none';
          }

          if (draggableClass) {
            mClassList(props.element).add(draggableClass);
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
    }
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
            var classList = mClassList(props.element);

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
          var classList = mClassList(activeProps.element);

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
          var classList = mClassList(activeProps.element);

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

  if (move(activeProps, position, activeProps.onDrag)) {
    if (!hasMoved) {
      hasMoved = true;

      if (movingClass) {
        mClassList(activeProps.element).add(movingClass);
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
    cssPropTransitionProperty = CSSPrefix.getName('transitionProperty');
    cssPropTransform = CSSPrefix.getName('transform');
    cssOrgValueBodyCursor = body.style.cursor;

    if (cssPropUserSelect = CSSPrefix.getName('userSelect')) {
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

    var layoutChange = AnimEvent.add(function (event) {
      if (layoutChanging) {
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
PlainDraggable.limit = true;
export default PlainDraggable;