/* ================================================
        DON'T MANUALLY EDIT THIS FILE
================================================ */

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

const
  ZINDEX = 9000,
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

  IS_EDGE = '-ms-scroll-limit' in document.documentElement.style &&
    '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,
  IS_TRIDENT = !IS_EDGE && !!document.uniqueID, // Future Edge might support `document.uniqueID`.
  IS_GECKO = 'MozAppearance' in document.documentElement.style,
  IS_BLINK = !IS_EDGE && !IS_GECKO && // Edge has `window.chrome`, and future Gecko might have that.
    !!window.chrome && !!window.CSS,
  IS_WEBKIT = !IS_EDGE && !IS_TRIDENT &&
    !IS_GECKO && !IS_BLINK && // Some engines support `webkit-*` properties.
    !window.chrome && 'WebkitAppearance' in document.documentElement.style,

  isObject = (() => {
    const toString = {}.toString,
      fnToString = {}.hasOwnProperty.toString,
      objFnString = fnToString.call(Object);
    return obj => {
      let proto, constr;
      return obj && toString.call(obj) === '[object Object]' &&
        (!(proto = Object.getPrototypeOf(obj)) ||
          (constr = proto.hasOwnProperty('constructor') && proto.constructor) &&
          typeof constr === 'function' && fnToString.call(constr) === objFnString);
    };
  })(),
  isFinite = Number.isFinite || (value => typeof value === 'number' && window.isFinite(value)),

  /** @type {Object.<_id: number, props>} */
  insProps = {},
  pointerOffset = {},
  pointerEvent = new PointerEvent();

let insId = 0,
  activeProps, hasMoved, body,
  // CSS property/value
  cssValueDraggableCursor, cssValueDraggingCursor, cssOrgValueBodyCursor,
  cssPropTransitionProperty, cssPropTransform, cssPropUserSelect, cssOrgValueBodyUserSelect,
  // Try to set `cursor` property.
  cssWantedValueDraggableCursor = IS_WEBKIT ? ['all-scroll', 'move'] : ['grab', 'all-scroll', 'move'],
  cssWantedValueDraggingCursor = IS_WEBKIT ? 'move' : ['grabbing', 'move'],
  // class
  draggableClass = 'plain-draggable',
  draggingClass = 'plain-draggable-dragging',
  movingClass = 'plain-draggable-moving';

// [AUTO-SCROLL]
// Scroll Animation Controller
const scrollFrame = {},
  MSPF = 1000 / 60, // ms/frame (FPS: 60)
  requestAnim = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (callback => setTimeout(callback, MSPF)),
  cancelAnim = window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    (requestID => clearTimeout(requestID));
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

  let curXyMoveArgs = {},
    curElement, curScrollXY, requestID;

  function frameUpdate() {
    const now = Date.now();
    ['x', 'y'].forEach(xy => {
      const moveArgs = curXyMoveArgs[xy];
      if (moveArgs) {
        const timeLen = now - moveArgs.lastFrameTime,
          absValue = curScrollXY(curElement, xy),
          curValue = moveArgs.lastValue != null &&
              Math.abs(moveArgs.lastValue - absValue) < 10 // It was not moved manually
            ? moveArgs.lastValue : absValue;
        if (moveArgs.dir === -1 ? (curValue > moveArgs.min) : (curValue < moveArgs.max)) {
          let newValue = curValue + moveArgs.speed * timeLen * moveArgs.dir;
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
  scrollFrame.move = (element, xyMoveArgs, scrollXY) => {
    cancelAnim.call(window, requestID);
    frameUpdate(); // Update current data now because it might be not continuation.

    // Re-use lastValue
    if (curElement === element) {
      if (xyMoveArgs.x && curXyMoveArgs.x) { xyMoveArgs.x.lastValue = curXyMoveArgs.x.lastValue; }
      if (xyMoveArgs.y && curXyMoveArgs.y) { xyMoveArgs.y.lastValue = curXyMoveArgs.y.lastValue; }
    }

    curElement = element;
    curXyMoveArgs = xyMoveArgs;
    curScrollXY = scrollXY;

    const now = Date.now();
    ['x', 'y'].forEach(xy => {
      const moveArgs = curXyMoveArgs[xy];
      if (moveArgs) { moveArgs.lastFrameTime = now; }
    });

    requestID = requestAnim.call(window, frame);
  };

  scrollFrame.stop = () => {
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
  const prop = xy === 'x' ? 'scrollLeft' : 'scrollTop';
  if (value != null) { element[prop] = value; }
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
  const scrollable = {};
  let cmpStyleHtml, cmpStyleBody, cmpStyleElement;

  // clientWidth/Height
  (function(target) {
    scrollable.clientWidth = target.clientWidth;
    scrollable.clientHeight = target.clientHeight;
  })(isWindow ? document.documentElement : element);

  // scrollWidth/Height
  /*
    Gecko bug, bottom-padding of element is reduced.
    Blink for Android bug, borders of <html> is rendered but those are not added to scrollW/H.
    Then, move it to max scroll position (sufficiently larger values) forcibly, and get scroll position.
  */
  let maxScrollLeft = 0,
    maxScrollTop = 0;
  if (!dontScroll) {
    let curScrollLeft, curScrollTop;
    if (isWindow) {
      curScrollLeft = scrollXYWindow(element, 'x');
      curScrollTop = scrollXYWindow(element, 'y');
      cmpStyleHtml = getComputedStyle(document.documentElement, '');
      cmpStyleBody = getComputedStyle(document.body, '');
      maxScrollLeft = scrollXYWindow(element, 'x',
        document.documentElement.scrollWidth +
        scrollable.clientWidth + // Blink for Android bug, scroll* returns size of smaller body
        ['marginLeft', 'marginRight', 'borderLeftWidth', 'borderRightWidth',
          'paddingLeft', 'paddingRight']
          .reduce((len, prop) => len + (parseFloat(cmpStyleHtml[prop]) || 0) +
            (parseFloat(cmpStyleBody[prop]) || 0), 0));
      maxScrollTop = scrollXYWindow(element, 'y',
        document.documentElement.scrollHeight +
        scrollable.clientHeight +
        ['marginTop', 'marginBottom', 'borderTopWidth', 'borderBottomWidth',
          'paddingTop', 'paddingBottom']
          .reduce((len, prop) => len + (parseFloat(cmpStyleHtml[prop]) || 0) +
            (parseFloat(cmpStyleBody[prop]) || 0), 0));

      scrollXYWindow(element, 'x', curScrollLeft);
      scrollXYWindow(element, 'y', curScrollTop);
    } else {
      curScrollLeft = scrollXYElement(element, 'x');
      curScrollTop = scrollXYElement(element, 'y');
      cmpStyleElement = getComputedStyle(element, '');
      maxScrollLeft = scrollXYElement(element, 'x',
        element.scrollWidth +
        scrollable.clientWidth + // Blink for Android bug, scroll* returns size of smaller body
        ['marginLeft', 'marginRight', 'borderLeftWidth', 'borderRightWidth',
          'paddingLeft', 'paddingRight']
          .reduce((len, prop) => len + (parseFloat(cmpStyleElement[prop]) || 0), 0));
      maxScrollTop = scrollXYElement(element, 'y',
        element.scrollHeight +
        scrollable.clientHeight +
        ['marginTop', 'marginBottom', 'borderTopWidth', 'borderBottomWidth',
          'paddingTop', 'paddingBottom']
          .reduce((len, prop) => len + (parseFloat(cmpStyleElement[prop]) || 0), 0));

      scrollXYElement(element, 'x', curScrollLeft);
      scrollXYElement(element, 'y', curScrollTop);
    }
  }
  scrollable.scrollWidth = scrollable.clientWidth + maxScrollLeft;
  scrollable.scrollHeight = scrollable.clientHeight + maxScrollTop;

  // clientX/Y
  let rect;
  if (isWindow) {
    scrollable.clientX = scrollable.clientY = 0;
  } else { // padding-box
    rect = element.getBoundingClientRect();
    if (!cmpStyleElement) { cmpStyleElement = getComputedStyle(element, ''); }
    scrollable.clientX = rect.left + (parseFloat(cmpStyleElement.borderLeftWidth) || 0);
    scrollable.clientY = rect.top + (parseFloat(cmpStyleElement.borderTopWidth) || 0);
  }

  return scrollable;
}
// [/AUTO-SCROLL]


function copyTree(obj) {
  return !obj ? obj :
    isObject(obj) ? Object.keys(obj).reduce((copyObj, key) => {
      copyObj[key] = copyTree(obj[key]);
      return copyObj;
    }, {}) :
    Array.isArray(obj) ? obj.map(copyTree) : obj;
}

function hasChanged(a, b) {
  let typeA, keysA;
  return typeof a !== typeof b ||
    (typeA = isObject(a) ? 'obj' : Array.isArray(a) ? 'array' : '') !==
      (isObject(b) ? 'obj' : Array.isArray(b) ? 'array' : '') ||
    (
      typeA === 'obj'
        ? hasChanged((keysA = Object.keys(a).sort()), Object.keys(b).sort()) ||
          keysA.some(prop => hasChanged(a[prop], b[prop])) :
        typeA === 'array'
          ? a.length !== b.length || a.some((aVal, i) => hasChanged(aVal, b[i])) :
          a !== b
    );
}

/**
 * @param {Element} element - A target element.
 * @returns {boolean} `true` if connected element.
 */
function isElement(element) {
  return !!(element &&
    element.nodeType === Node.ELEMENT_NODE &&
    // element instanceof HTMLElement &&
    typeof element.getBoundingClientRect === 'function' &&
    !(element.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED));
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
  if (!isObject(bBox)) { return null; }
  let value;
  if (isFinite((value = bBox.left)) || isFinite((value = bBox.x))) {
    bBox.left = bBox.x = value;
  } else { return null; }
  if (isFinite((value = bBox.top)) || isFinite((value = bBox.y))) {
    bBox.top = bBox.y = value;
  } else { return null; }

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
    const matches = /^(.+?)(%)?$/.exec(inString);
    let value, isRatio;
    return matches && isFinite((value = parseFloat(matches[1])))
      ? {value: (isRatio = !!(matches[2] && value)) ? value / 100 : value, isRatio} : null; // 0% -> 0
  }

  return isFinite(value) ? {value, isRatio: false} :
    typeof value === 'string' ? string2PPValue(value.replace(/\s/g, '')) : null;
}

function ppValue2OptionValue(ppValue) {
  return ppValue.isRatio ? `${ppValue.value * 100}%` : ppValue.value;
}

function resolvePPValue(ppValue, baseOrigin, baseSize) {
  return typeof ppValue === 'number' ? ppValue :
    baseOrigin + ppValue.value * (ppValue.isRatio ? baseSize : 1);
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
  if (!isObject(bBox)) { return null; }
  let ppValue;
  if ((ppValue = validPPValue(bBox.left)) || (ppValue = validPPValue(bBox.x))) {
    bBox.left = bBox.x = ppValue;
  } else { return null; }
  if ((ppValue = validPPValue(bBox.top)) || (ppValue = validPPValue(bBox.y))) {
    bBox.top = bBox.y = ppValue;
  } else { return null; }

  if ((ppValue = validPPValue(bBox.width)) && ppValue.value >= 0) {
    bBox.width = ppValue;
    delete bBox.right;
  } else if ((ppValue = validPPValue(bBox.right))) {
    bBox.right = ppValue;
    delete bBox.width;
  } else { return null; }
  if ((ppValue = validPPValue(bBox.height)) && ppValue.value >= 0) {
    bBox.height = ppValue;
    delete bBox.bottom;
  } else if ((ppValue = validPPValue(bBox.bottom))) {
    bBox.bottom = ppValue;
    delete bBox.height;
  } else { return null; }
  return bBox;
}

function ppBBox2OptionObject(ppBBox) {
  return Object.keys(ppBBox).reduce((obj, prop) => {
    obj[prop] = ppValue2OptionValue(ppBBox[prop]);
    return obj;
  }, {});
}

// PPBBox -> BBox
function resolvePPBBox(ppBBox, baseBBox) {
  const prop2Axis = {left: 'x', right: 'x', x: 'x', width: 'x',
      top: 'y', bottom: 'y', y: 'y', height: 'y'},
    baseOriginXY = {x: baseBBox.left, y: baseBBox.top},
    baseSizeXY = {x: baseBBox.width, y: baseBBox.height};
  return validBBox(Object.keys(ppBBox).reduce((bBox, prop) => {
    bBox[prop] = resolvePPValue(ppBBox[prop],
      prop === 'width' || prop === 'height' ? 0 : baseOriginXY[prop2Axis[prop]],
      baseSizeXY[prop2Axis[prop]]);
    return bBox;
  }, {}));
}

/**
 * @param {Element} element - A target element.
 * @param {?boolean} getPaddingBox - Get padding-box instead of border-box as bounding-box.
 * @returns {BBox} A bounding-box of `element`.
 */
function getBBox(element, getPaddingBox) {
  const rect = element.getBoundingClientRect(),
    bBox = {left: rect.left, top: rect.top, width: rect.width, height: rect.height};
  bBox.left += window.pageXOffset;
  bBox.top += window.pageYOffset;
  if (getPaddingBox) {
    const style = window.getComputedStyle(element, ''),
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
  const style = element.style;
  style.webkitTapHighlightColor = 'transparent';

  // Only when it has no shadow
  const cssPropBoxShadow = CSSPrefix.getName('boxShadow'),
    boxShadow = window.getComputedStyle(element, '')[cssPropBoxShadow];
  if (!boxShadow || boxShadow === 'none') {
    style[cssPropBoxShadow] = '0 0 1px transparent';
  }

  if (gpuTrigger && cssPropTransform) { style[cssPropTransform] = 'translateZ(0)'; }
  return element;
}

function setDraggableCursor(element, orgCursor) {
  if (cssValueDraggableCursor == null) {
    if (cssWantedValueDraggableCursor !== false) {
      cssValueDraggableCursor = CSSPrefix.getValue('cursor', cssWantedValueDraggableCursor);
    }
    // The wanted value was denied, or changing is not wanted.
    if (cssValueDraggableCursor == null) { cssValueDraggableCursor = false; }
  }
  // Update it to change a state even if cssValueDraggableCursor is false.
  element.style.cursor = cssValueDraggableCursor === false ? orgCursor : cssValueDraggableCursor;
}

function setDraggingCursor(element) {
  if (cssValueDraggingCursor == null) {
    if (cssWantedValueDraggingCursor !== false) {
      cssValueDraggingCursor = CSSPrefix.getValue('cursor', cssWantedValueDraggingCursor);
    }
    // The wanted value was denied, or changing is not wanted.
    if (cssValueDraggingCursor == null) { cssValueDraggingCursor = false; }
  }
  if (cssValueDraggingCursor !== false) { element.style.cursor = cssValueDraggingCursor; }
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
  const svgPoint = props.svgPoint;
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
  const elementBBox = props.elementBBox;
  if (position.left !== elementBBox.left || position.top !== elementBBox.top) {
    const offset = props.htmlOffset;
    props.elementStyle[cssPropTransform] =
      `translate(${position.left + offset.left}px, ${position.top + offset.top}px)`;
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
  const elementBBox = props.elementBBox,
    elementStyle = props.elementStyle,
    offset = props.htmlOffset;
  let moved = false;
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
  const elementBBox = props.elementBBox;
  if (position.left !== elementBBox.left || position.top !== elementBBox.top) {
    const offset = props.svgOffset,
      originBBox = props.svgOriginBBox,
      point = viewPoint2SvgPoint(props,
        position.left - window.pageXOffset, position.top - window.pageYOffset);
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
  const elementBBox = props.elementBBox;

  function fix() {
    if (props.minLeft >= props.maxLeft) { // Disabled
      position.left = elementBBox.left;
    } else if (position.left < props.minLeft) {
      position.left = props.minLeft;
    } else if (position.left > props.maxLeft) {
      position.left = props.maxLeft;
    }
    if (props.minTop >= props.maxTop) { // Disabled
      position.top = elementBBox.top;
    } else if (position.top < props.minTop) {
      position.top = props.minTop;
    } else if (position.top > props.maxTop) {
      position.top = props.maxTop;
    }
  }

  fix();
  if (cbCheck) {
    if (cbCheck(position) === false) { return false; }
    fix(); // Again
  }

  const moved = props.moveElm(props, position);
  if (moved) { // Update elementBBox
    props.elementBBox = validBBox({left: position.left, top: position.top,
      width: elementBBox.width, height: elementBBox.height});
  }
  return moved;
}

/**
 * Initialize HTMLElement for `translate`, and get `offset` that is used by `moveTranslate`.
 * @param {props} props - `props` of instance.
 * @returns {BBox} Current BBox without animation, i.e. left/top properties.
 */
function initTranslate(props) {
  const element = props.element,
    elementStyle = props.elementStyle,
    curPosition = getBBox(element), // Get BBox before change style.
    RESTORE_PROPS = ['display', 'marginTop', 'marginBottom', 'width', 'height'];
  RESTORE_PROPS.unshift(cssPropTransform);

  // Reset `transition-property` every time because it might be changed frequently.
  const orgTransitionProperty = elementStyle[cssPropTransitionProperty];
  elementStyle[cssPropTransitionProperty] = 'none'; // Disable animation
  const fixPosition = getBBox(element);

  if (!props.orgStyle) {
    props.orgStyle = RESTORE_PROPS.reduce((orgStyle, prop) => {
      orgStyle[prop] = elementStyle[prop] || '';
      return orgStyle;
    }, {});
    props.lastStyle = {};
  } else {
    RESTORE_PROPS.forEach(prop => {
      // Skip this if it seems user changed it. (it can't check perfectly.)
      if (props.lastStyle[prop] == null || elementStyle[prop] === props.lastStyle[prop]) {
        elementStyle[prop] = props.orgStyle[prop];
      }
    });
  }

  const orgSize = getBBox(element),
    cmpStyle = window.getComputedStyle(element, '');
  // https://www.w3.org/TR/css-transforms-1/#transformable-element
  if (cmpStyle.display === 'inline') {
    elementStyle.display = 'inline-block';
    ['Top', 'Bottom'].forEach(dirProp => {
      const padding = parseFloat(cmpStyle[`padding${dirProp}`]);
      // paddingTop/Bottom make padding but don't make space -> negative margin in inline-block
      // marginTop/Bottom don't work in inline element -> `0` in inline-block
      elementStyle[`margin${dirProp}`] = padding ? `-${padding}px` : '0';
    });
  }
  elementStyle[cssPropTransform] = 'translate(0, 0)';
  // Get document offset.
  let newBBox = getBBox(element);
  const offset = props.htmlOffset =
    {left: newBBox.left ? -newBBox.left : 0, top: newBBox.top ? -newBBox.top : 0}; // avoid `-0`

  // Restore position
  elementStyle[cssPropTransform] =
    `translate(${curPosition.left + offset.left}px, ${curPosition.top + offset.top}px)`;
  // Restore size
  ['width', 'height'].forEach(prop => {
    if (newBBox[prop] !== orgSize[prop]) {
      // Ignore `box-sizing`
      elementStyle[prop] = orgSize[prop] + 'px';
      newBBox = getBBox(element);
      if (newBBox[prop] !== orgSize[prop]) { // Retry
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
    elementStyle[cssPropTransform] =
      `translate(${fixPosition.left + offset.left}px, ${fixPosition.top + offset.top}px)`;
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
  const element = props.element,
    elementStyle = props.elementStyle,
    curPosition = getBBox(element), // Get BBox before change style.
    RESTORE_PROPS = ['position', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'width', 'height'];

  // Reset `transition-property` every time because it might be changed frequently.
  const orgTransitionProperty = elementStyle[cssPropTransitionProperty];
  elementStyle[cssPropTransitionProperty] = 'none'; // Disable animation
  const fixPosition = getBBox(element);

  if (!props.orgStyle) {
    props.orgStyle = RESTORE_PROPS.reduce((orgStyle, prop) => {
      orgStyle[prop] = elementStyle[prop] || '';
      return orgStyle;
    }, {});
    props.lastStyle = {};
  } else {
    RESTORE_PROPS.forEach(prop => {
      // Skip this if it seems user changed it. (it can't check perfectly.)
      if (props.lastStyle[prop] == null || elementStyle[prop] === props.lastStyle[prop]) {
        elementStyle[prop] = props.orgStyle[prop];
      }
    });
  }

  const orgSize = getBBox(element);
  elementStyle.position = 'absolute';
  elementStyle.left = elementStyle.top = elementStyle.margin = '0';
  // Get document offset.
  let newBBox = getBBox(element);
  const offset = props.htmlOffset =
    {left: newBBox.left ? -newBBox.left : 0, top: newBBox.top ? -newBBox.top : 0}; // avoid `-0`

  // Restore position
  elementStyle.left = curPosition.left + offset.left + 'px';
  elementStyle.top = curPosition.top + offset.top + 'px';
  // Restore size
  ['width', 'height'].forEach(prop => {
    if (newBBox[prop] !== orgSize[prop]) {
      // Ignore `box-sizing`
      elementStyle[prop] = orgSize[prop] + 'px';
      newBBox = getBBox(element);
      if (newBBox[prop] !== orgSize[prop]) { // Retry
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
  const element = props.element,
    svgTransform = props.svgTransform,
    curRect = element.getBoundingClientRect(), // Get Rect before change position.
    fixPosition = getBBox(element);

  svgTransform.setTranslate(0, 0);
  const originBBox = props.svgOriginBBox = element.getBBox(),
    // Try to get SVG coordinates of current position.
    newRect = element.getBoundingClientRect(),
    originPoint = viewPoint2SvgPoint(props, newRect.left, newRect.top),
    // Gecko bug, getScreenCTM returns incorrect CTM, and originPoint might not be current position.
    offset = props.svgOffset = {x: originBBox.x - originPoint.x, y: originBBox.y - originPoint.y},

    // Restore position
    curPoint = viewPoint2SvgPoint(props, curRect.left, curRect.top);
  svgTransform.setTranslate(curPoint.x + offset.x - originBBox.x, curPoint.y + offset.y - originBBox.y);

  return fixPosition;
}
// [/SVG]

/**
 * Set `elementBBox`, `containmentBBox`, `min/max``Left/Top` and `snapTargets`.
 * @param {props} props - `props` of instance.
 * @param {string} [eventType] - A type of event that kicked this method.
 * @returns {void}
 */
function initBBox(props, eventType) { // eslint-disable-line no-unused-vars
  const docBBox = getBBox(document.documentElement),
    elementBBox = props.elementBBox = props.initElm(props), // reset offset etc.
    containmentBBox = props.containmentBBox =
      props.containmentIsBBox ? (resolvePPBBox(props.options.containment, docBBox) || docBBox) :
      getBBox(props.options.containment, true);
  props.minLeft = containmentBBox.left;
  props.maxLeft = containmentBBox.right - elementBBox.width;
  props.minTop = containmentBBox.top;
  props.maxTop = containmentBBox.bottom - elementBBox.height;
  // Adjust position
  move(props, {left: elementBBox.left, top: elementBBox.top});

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
    const elementSizeXY = {x: elementBBox.width, y: elementBBox.height},
      minXY = {x: props.minLeft, y: props.minTop},
      maxXY = {x: props.maxLeft, y: props.maxTop},
      prop2Axis = {left: 'x', right: 'x', x: 'x', width: 'x', xStart: 'x', xEnd: 'x', xStep: 'x',
        top: 'y', bottom: 'y', y: 'y', height: 'y', yStart: 'y', yEnd: 'y', yStep: 'y'},

      snapTargets = props.parsedSnapTargets.reduce((snapTargets, parsedSnapTarget) => {
        const baseRect = parsedSnapTarget.base === 'containment' ? containmentBBox : docBBox,
          baseOriginXY = {x: baseRect.left, y: baseRect.top},
          baseSizeXY = {x: baseRect.width, y: baseRect.height};

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
          if (targetXY.center == null) { targetXY.center = parsedSnapTarget.center; }
          if (targetXY.xGravity == null) { targetXY.xGravity = parsedSnapTarget.gravity; }
          if (targetXY.yGravity == null) { targetXY.yGravity = parsedSnapTarget.gravity; }

          if (targetXY.x != null && targetXY.y != null) { // Point
            targetXY.x = resolvePPValue(targetXY.x, baseOriginXY.x, baseSizeXY.x);
            targetXY.y = resolvePPValue(targetXY.y, baseOriginXY.y, baseSizeXY.y);

            if (targetXY.center) {
              targetXY.x -= elementSizeXY.x / 2;
              targetXY.y -= elementSizeXY.y / 2;
              targetXY.corners = ['tl'];
            }

            (targetXY.corners || parsedSnapTarget.corners).forEach(corner => {
              const x = targetXY.x - (corner === 'tr' || corner === 'br' ? elementSizeXY.x : 0),
                y = targetXY.y - (corner === 'bl' || corner === 'br' ? elementSizeXY.y : 0);
              if (x >= minXY.x && x <= maxXY.x && y >= minXY.y && y <= maxXY.y) {
                const snapTarget = {x, y},
                  gravityXStart = x - targetXY.xGravity,
                  gravityXEnd = x + targetXY.xGravity,
                  gravityYStart = y - targetXY.yGravity,
                  gravityYEnd = y + targetXY.yGravity;
                if (gravityXStart > minXY.x) { snapTarget.gravityXStart = gravityXStart; }
                if (gravityXEnd < maxXY.x) { snapTarget.gravityXEnd = gravityXEnd; }
                if (gravityYStart > minXY.y) { snapTarget.gravityYStart = gravityYStart; }
                if (gravityYEnd < maxXY.y) { snapTarget.gravityYEnd = gravityYEnd; }
                snapTargets.push(snapTarget);
              }
            });

          } else { // Line
            const specAxis = targetXY.x != null ? 'x' : 'y',
              rangeAxis = specAxis === 'x' ? 'y' : 'x',
              startProp = `${rangeAxis}Start`,
              endProp = `${rangeAxis}End`,
              gravityProp = `${specAxis}Gravity`,
              specAxisL = specAxis.toUpperCase(),
              rangeAxisL = rangeAxis.toUpperCase(),
              gravitySpecStartProp = `gravity${specAxisL}Start`,
              gravitySpecEndProp = `gravity${specAxisL}End`,
              gravityRangeStartProp = `gravity${rangeAxisL}Start`,
              gravityRangeEndProp = `gravity${rangeAxisL}End`;
            targetXY[specAxis] =
              resolvePPValue(targetXY[specAxis], baseOriginXY[specAxis], baseSizeXY[specAxis]);
            targetXY[startProp] =
              resolvePPValue(targetXY[startProp], baseOriginXY[rangeAxis], baseSizeXY[rangeAxis]);
            targetXY[endProp] =
              resolvePPValue(targetXY[endProp], baseOriginXY[rangeAxis], baseSizeXY[rangeAxis]) -
              elementSizeXY[rangeAxis]; // Reduce the end of the line.
            if (targetXY[startProp] > targetXY[endProp] || // Smaller than element size.
                targetXY[startProp] > maxXY[rangeAxis] || targetXY[endProp] < minXY[rangeAxis]) {
              return;
            }

            if (targetXY.center) {
              targetXY[specAxis] -= elementSizeXY[specAxis] / 2;
              targetXY.sides = ['start'];
            }

            (targetXY.sides || parsedSnapTarget.sides).forEach(side => {
              const xy = targetXY[specAxis] - (side === 'end' ? elementSizeXY[specAxis] : 0);
              if (xy >= minXY[specAxis] && xy <= maxXY[specAxis]) {
                const snapTarget = {},
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

        let bBox;
        if ((bBox = parsedSnapTarget.element ? getBBox(parsedSnapTarget.element) : null) || // Element
            parsedSnapTarget.ppBBox) {
          if (parsedSnapTarget.ppBBox) { bBox = resolvePPBBox(parsedSnapTarget.ppBBox, baseRect); } // BBox
          if (bBox) { // Drop invalid BBox.
            // Expand into 4 lines.
            parsedSnapTarget.edges.forEach(edge => {
              let lengthenX = parsedSnapTarget.gravity,
                lengthenY = parsedSnapTarget.gravity;
              if (edge === 'outside') { // Snap it when a part of the element is part of the range.
                lengthenX += elementBBox.width;
                lengthenY += elementBBox.height;
              }
              const xStart = bBox.left - lengthenX,
                xEnd = bBox.right + lengthenX,
                yStart = bBox.top - lengthenY,
                yEnd = bBox.bottom + lengthenY;
              let side = edge === 'inside' ? 'start' : 'end';
              addSnapTarget({xStart, xEnd, y: bBox.top, sides: [side], center: false}); // Top
              addSnapTarget({x: bBox.left, yStart, yEnd, sides: [side], center: false}); // Left
              side = edge === 'inside' ? 'end' : 'start';
              addSnapTarget({xStart, xEnd, y: bBox.bottom, sides: [side], center: false}); // Bottom
              addSnapTarget({x: bBox.right, yStart, yEnd, sides: [side], center: false}); // Right
            });
          }

        } else {
          let expanded = [
            ['x', 'y', 'xStart', 'xEnd', 'xStep', 'yStart', 'yEnd', 'yStep'].reduce((targetXY, prop) => {
              if (parsedSnapTarget[prop]) {
                targetXY[prop] = resolvePPValue(parsedSnapTarget[prop],
                  prop === 'xStep' || prop === 'yStep' ? 0 : baseOriginXY[prop2Axis[prop]],
                  baseSizeXY[prop2Axis[prop]]);
              }
              return targetXY;
            }, {})
          ];

          ['x', 'y'].forEach(axis => {
            const startProp = `${axis}Start`,
              endProp = `${axis}End`,
              stepProp = `${axis}Step`,
              gravityProp = `${axis}Gravity`;
            expanded = expanded.reduce((expanded, targetXY) => {
              const start = targetXY[startProp],
                end = targetXY[endProp],
                step = targetXY[stepProp];
              if (start != null && end != null && start >= end) { return expanded; } // start >= end

              if (step != null) {
                if (step < 2) { return expanded; }
                // step >= 2px -> Expand by step
                let gravity = step / 2; // max
                gravity = parsedSnapTarget.gravity > gravity ? gravity : null;
                for (let curValue = start; curValue <= end; curValue += step) {
                  const expandedXY = Object.keys(targetXY).reduce((expandedXY, prop) => {
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
          expanded.forEach(targetXY => { addSnapTarget(targetXY); });
        }

        return snapTargets;
      }, []);

    props.snapTargets = snapTargets.length ? snapTargets : null;
  }
  // [/SNAP]

  // [AUTO-SCROLL]
  const autoScroll = {},
    autoScrollOptions = props.options.autoScroll;
  if (autoScrollOptions) {
    autoScroll.isWindow = autoScrollOptions.target === window;
    autoScroll.target = autoScrollOptions.target;

    const dontScroll = eventType === 'scroll', // Avoid duplicated calling
      scrollable = getScrollable(autoScrollOptions.target, autoScroll.isWindow, dontScroll),
      scrollableBBox = validBBox({left: scrollable.clientX, top: scrollable.clientY,
        width: scrollable.clientWidth, height: scrollable.clientHeight});

    if (!dontScroll) {
      autoScroll.scrollWidth = scrollable.scrollWidth;
      autoScroll.scrollHeight = scrollable.scrollHeight;
    } else if (props.autoScroll) {
      autoScroll.scrollWidth = props.autoScroll.scrollWidth;
      autoScroll.scrollHeight = props.autoScroll.scrollHeight;
    }

    [['X', 'Width', 'left', 'right'], ['Y', 'Height', 'top', 'bottom']].forEach(axis => {
      const xy = axis[0],
        wh = axis[1],
        back = axis[2],
        forward = axis[3],
        maxAbs = (autoScroll[`scroll${wh}`] || 0) - scrollable[`client${wh}`],
        min = autoScrollOptions[`min${xy}`] || 0;
      let max = isFinite(autoScrollOptions[`max${xy}`]) ? autoScrollOptions[`max${xy}`] : maxAbs;
      if (min < max && min < maxAbs) {
        if (max > maxAbs) { max = maxAbs; }

        const lines = [],
          elementSize = elementBBox[wh.toLowerCase()];
        for (let i = autoScrollOptions.sensitivity.length - 1; i >= 0; i--) { // near -> far
          const sensitivity = autoScrollOptions.sensitivity[i],
            speed = autoScrollOptions.speed[i];
          // back
          lines.push({dir: -1, speed,
            position: scrollableBBox[back] + sensitivity});
          // forward
          lines.push({dir: 1, speed,
            position: scrollableBBox[forward] - sensitivity - elementSize});
        }

        autoScroll[xy.toLowerCase()] = {min, max, lines};
      }
    });

  }
  props.autoScroll = autoScroll.x || autoScroll.y ? autoScroll : null;
  // [/AUTO-SCROLL]
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function dragEnd(props) {
  scrollFrame.stop(); // [AUTO-SCROLL/]
  setDraggableCursor(props.options.handle, props.orgCursor);
  body.style.cursor = cssOrgValueBodyCursor;

  if (props.options.zIndex !== false) { props.elementStyle.zIndex = props.orgZIndex; }
  if (cssPropUserSelect) { body.style[cssPropUserSelect] = cssOrgValueBodyUserSelect; }
  const classList = mClassList(props.element);
  if (movingClass) { classList.remove(movingClass); }
  if (draggingClass) { classList.remove(draggingClass); }

  activeProps = null;
  pointerEvent.cancel(); // Reset pointer (activeProps must be null because this calls endHandler)
  if (props.onDragEnd) {
    props.onDragEnd({left: props.elementBBox.left, top: props.elementBBox.top});
  }
}

/**
 * @param {props} props - `props` of instance.
 * @param {{clientX, clientY}} pointerXY - This might be MouseEvent, Touch of TouchEvent or Object.
 * @returns {boolean} `true` if it started.
 */
function dragStart(props, pointerXY) {
  if (props.disabled) { return false; }
  if (props.onDragStart && props.onDragStart(pointerXY) === false) { return false; }
  if (activeProps) { dragEnd(activeProps); } // activeItem is normally null by pointerEvent.end.

  setDraggingCursor(props.options.handle);
  body.style.cursor = cssValueDraggingCursor || // If it is `false` or `''`
    window.getComputedStyle(props.options.handle, '').cursor;

  if (props.options.zIndex !== false) { props.elementStyle.zIndex = props.options.zIndex; }
  if (cssPropUserSelect) { body.style[cssPropUserSelect] = 'none'; }
  if (draggingClass) { mClassList(props.element).add(draggingClass); }

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
function setOptions(props, newOptions) {
  const options = props.options;
  let needsInitBBox;

  // containment
  if (newOptions.containment) {
    let bBox;
    if (isElement(newOptions.containment)) { // Specific element
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
      return typeof inString === 'string'
        ? inString.replace(/[, ]+/g, ' ').trim().toLowerCase() : null;
    }

    // gravity
    if (isFinite(newOptions.gravity) && newOptions.gravity > 0) { options.gravity = newOptions.gravity; }
    // corner
    let corner = cleanString(newOptions.corner);
    if (corner) {
      if (corner !== 'all') {
        const added = {},
          corners = corner.split(/\s/).reduce((corners, corner) => {
            corner = corner.trim().replace(/^(.).*?-(.).*$/, '$1$2');
            if ((corner =
                corner === 'tl' || corner === 'lt' ? 'tl' :
                corner === 'tr' || corner === 'rt' ? 'tr' :
                corner === 'bl' || corner === 'lb' ? 'bl' :
                corner === 'br' || corner === 'rb' ? 'br' :
                null) && !added[corner]) {
              corners.push(corner);
              added[corner] = true;
            }
            return corners;
          }, []),
          cornersLen = corners.length;
        corner = !cornersLen ? null : cornersLen === 4 ? 'all' : corners.join(' ');
      }
      if (corner) { options.corner = corner; }
    }
    // side
    const side = cleanString(newOptions.side);
    if (side) {
      if (side === 'start' || side === 'end' || side === 'both') {
        options.side = side;
      } else if (side === 'start end' || side === 'end start') {
        options.side = 'both';
      }
    }
    // center
    if (typeof newOptions.center === 'boolean') { options.center = newOptions.center; }
    // edge
    const edge = cleanString(newOptions.edge);
    if (edge) {
      if (edge === 'inside' || edge === 'outside' || edge === 'both') {
        options.edge = edge;
      } else if (edge === 'inside outside' || edge === 'outside inside') {
        options.edge = 'both';
      }
    }
    // base
    const base = typeof newOptions.base === 'string' ? newOptions.base.trim().toLowerCase() : null;
    if (base && (base === 'containment' || base === 'document')) { options.base = base; }
    return options;
  }

  // snap
  if (newOptions.snap != null) {
    const newSnapOptions =
        isObject(newOptions.snap) && (newOptions.snap.targets != null) ? newOptions.snap :
        {targets: newOptions.snap},
      snapTargetsOptions = [],
      snapOptions = commonSnapOptions({targets: snapTargetsOptions}, newSnapOptions);

    // Set default options into top level.
    if (!snapOptions.gravity) { snapOptions.gravity = SNAP_GRAVITY; }
    if (!snapOptions.corner) { snapOptions.corner = SNAP_CORNER; }
    if (!snapOptions.side) { snapOptions.side = SNAP_SIDE; }
    if (typeof snapOptions.center !== 'boolean') { snapOptions.center = false; }
    if (!snapOptions.edge) { snapOptions.edge = SNAP_EDGE; }
    if (!snapOptions.base) { snapOptions.base = SNAP_BASE; }

    const parsedSnapTargets = (
      Array.isArray(newSnapOptions.targets) ? newSnapOptions.targets : [newSnapOptions.targets]
    ).reduce((parsedSnapTargets, target) => {
      if (target == null) { return parsedSnapTargets; }

      const isElementPre = isElement(target), // Pre-check direct value
        ppBBoxPre = validPPBBox(copyTree(target)), // Pre-check direct value
        newSnapTargetOptions =
          isElementPre || ppBBoxPre ? {boundingBox: target} : // Direct Element | PPBBox
          isObject(target) &&
            target.start == null && target.end == null && target.step == null ? target : // SnapTargetOptions
          {x: target, y: target}, // Others, it might be {step, start, end}
        expandedParsedSnapTargets = [],
        snapTargetOptions = {},
        newOptionsBBox = newSnapTargetOptions.boundingBox;
      let ppBBox;

      if (isElementPre || isElement(newOptionsBBox)) { // Element
        expandedParsedSnapTargets.push({element: newOptionsBBox});
        snapTargetOptions.boundingBox = newOptionsBBox;
      } else if ((ppBBox = ppBBoxPre || validPPBBox(copyTree(newOptionsBBox)))) { // Object -> PPBBox
        expandedParsedSnapTargets.push({ppBBox});
        snapTargetOptions.boundingBox = ppBBox2OptionObject(ppBBox);

      } else {
        let invalid; // `true` if valid PPValue was given but the contained value is invalid.
        const parsedXY = ['x', 'y'].reduce((parsedXY, axis) => {
          const newOptionsXY = newSnapTargetOptions[axis];
          let ppValue;

          if ((ppValue = validPPValue(newOptionsXY))) { // pixels | '<n>%'
            parsedXY[axis] = ppValue;
            snapTargetOptions[axis] = ppValue2OptionValue(ppValue);

          } else { // {start, end} | {step, start, end}
            let start, end, step;
            if (isObject(newOptionsXY)) {
              start = validPPValue(newOptionsXY.start);
              end = validPPValue(newOptionsXY.end);
              step = validPPValue(newOptionsXY.step);
              if (start && end && start.isRatio === end.isRatio && start.value >= end.value) { // start >= end
                invalid = true;
              }
            }
            start = parsedXY[`${axis}Start`] = start || {value: 0, isRatio: false};
            end = parsedXY[`${axis}End`] = end || {value: 1, isRatio: true};
            snapTargetOptions[axis] = {start: ppValue2OptionValue(start), end: ppValue2OptionValue(end)};
            if (step) {
              if (step.isRatio ? step.value > 0 : step.value >= 2) { // step > 0% || step >= 2px
                parsedXY[`${axis}Step`] = step;
                snapTargetOptions[axis].step = ppValue2OptionValue(step);
              } else {
                invalid = true;
              }
            }
          }
          return parsedXY;
        }, {});
        if (invalid) { return parsedSnapTargets; }

        if (parsedXY.xStart && !parsedXY.xStep && parsedXY.yStart && !parsedXY.yStep) {
          // Expand into 4 lines. This is not BBox, and `edge` is ignored.
          expandedParsedSnapTargets.push(
            {xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yStart}, // Top
            {xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yEnd}, // Bottom
            {x: parsedXY.xStart, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd}, // Left
            {x: parsedXY.xEnd, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd} // Right
          );
        } else {
          expandedParsedSnapTargets.push(parsedXY);
        }
      }

      if (expandedParsedSnapTargets.length) {
        snapTargetsOptions.push(commonSnapOptions(snapTargetOptions, newSnapTargetOptions));
        // Copy common SnapOptions
        const corner = snapTargetOptions.corner || snapOptions.corner,
          side = snapTargetOptions.side || snapOptions.side,
          edge = snapTargetOptions.edge || snapOptions.edge,
          commonOptions = {
            gravity: snapTargetOptions.gravity || snapOptions.gravity,
            base: snapTargetOptions.base || snapOptions.base,
            center: typeof snapTargetOptions.center === 'boolean'
              ? snapTargetOptions.center : snapOptions.center,
            corners: corner === 'all' ? SNAP_ALL_CORNERS : corner.split(' '), // Split
            sides: side === 'both' ? SNAP_ALL_SIDES : [side], // Split
            edges: edge === 'both' ? SNAP_ALL_EDGES : [edge] // Split
          };
        expandedParsedSnapTargets.forEach(parsedSnapTarget => {
          // Set common SnapOptions
          ['gravity', 'corners', 'sides', 'center', 'edges', 'base'].forEach(
            option => { parsedSnapTarget[option] = commonOptions[option]; });
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
    const newAutoScrollOptions =
        isObject(newOptions.autoScroll) ? newOptions.autoScroll :
        {target: newOptions.autoScroll === true ? window : newOptions.autoScroll},
      autoScrollOptions = {};

    // target
    autoScrollOptions.target =
      isElement(newAutoScrollOptions.target) ? newAutoScrollOptions.target : window;
    // speed
    autoScrollOptions.speed = [];
    (Array.isArray(newAutoScrollOptions.speed)
      ? newAutoScrollOptions.speed : [newAutoScrollOptions.speed]).every((speed, i) => {
      if (i <= 2 && isFinite(speed)) {
        autoScrollOptions.speed[i] = speed;
        return true;
      }
      return false;
    });
    if (!autoScrollOptions.speed.length) {
      autoScrollOptions.speed = AUTOSCROLL_SPEED;
    }
    // sensitivity
    const newSensitivity = Array.isArray(newAutoScrollOptions.sensitivity)
      ? newAutoScrollOptions.sensitivity : [newAutoScrollOptions.sensitivity];
    autoScrollOptions.sensitivity = autoScrollOptions.speed.map(
      (v, i) => (isFinite(newSensitivity[i]) ? newSensitivity[i] : AUTOSCROLL_SENSITIVITY[i]));
    // min*, max*
    ['X', 'Y'].forEach(option => {
      const optionMin = `min${option}`,
        optionMax = `max${option}`;
      if (isFinite(newAutoScrollOptions[optionMin]) && newAutoScrollOptions[optionMin] >= 0) {
        autoScrollOptions[optionMin] = newAutoScrollOptions[optionMin];
      }
      if (isFinite(newAutoScrollOptions[optionMax]) && newAutoScrollOptions[optionMax] >= 0 &&
          (!autoScrollOptions[optionMin] ||
            newAutoScrollOptions[optionMax] >= autoScrollOptions[optionMin])) {
        autoScrollOptions[optionMax] = newAutoScrollOptions[optionMax];
      }
    });

    if (hasChanged(autoScrollOptions, options.autoScroll)) {
      options.autoScroll = autoScrollOptions;
      needsInitBBox = true;
    }
  } else if (newOptions.hasOwnProperty('autoScroll')) {
    if (options.autoScroll) { needsInitBBox = true; }
    options.autoScroll = void 0;
  }

  // [/AUTO-SCROLL]

  if (needsInitBBox) { initBBox(props); }

  // handle
  if (isElement(newOptions.handle) && newOptions.handle !== options.handle) {
    if (options.handle) { // Restore
      options.handle.style.cursor = props.orgCursor;
      if (cssPropUserSelect) { options.handle.style[cssPropUserSelect] = props.orgUserSelect; }
      pointerEvent.removeStartHandler(options.handle, props.pointerEventHandlerId);
    }
    const handle = options.handle = newOptions.handle;
    props.orgCursor = handle.style.cursor;
    setDraggableCursor(handle, props.orgCursor);
    if (cssPropUserSelect) {
      props.orgUserSelect = handle.style[cssPropUserSelect];
      handle.style[cssPropUserSelect] = 'none';
    }
    pointerEvent.addStartHandler(handle, props.pointerEventHandlerId);
  }

  // zIndex
  if (isFinite(newOptions.zIndex) || newOptions.zIndex === false) {
    options.zIndex = newOptions.zIndex;
    if (props === activeProps) {
      props.elementStyle.zIndex = options.zIndex === false ? props.orgZIndex : options.zIndex;
    }
  }

  // left/top
  const position = {left: props.elementBBox.left, top: props.elementBBox.top};
  let needsMove;
  if (isFinite(newOptions.left) && newOptions.left !== position.left) {
    position.left = newOptions.left;
    needsMove = true;
  }
  if (isFinite(newOptions.top) && newOptions.top !== position.top) {
    position.top = newOptions.top;
    needsMove = true;
  }
  if (needsMove) { move(props, position); }

  // Event listeners
  ['onDrag', 'onMove', 'onDragStart', 'onMoveStart', 'onDragEnd'].forEach(option => {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
      props[option] = options[option].bind(props.ins);
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = props[option] = void 0;
    }
  });
}

class PlainDraggable {
  /**
   * Create a `PlainDraggable` instance.
   * @param {Element} element - Target element.
   * @param {Object} [options] - Options.
   */
  constructor(element, options) {
    const props = {
      ins: this,
      options: { // Initial options (not default)
        zIndex: ZINDEX // Initial state.
      },
      disabled: false
    };

    Object.defineProperty(this, '_id', {value: ++insId});
    props._id = this._id;
    insProps[this._id] = props;

    if (!isElement(element) || element === body) { throw new Error('This element is not accepted.'); }
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    let gpuTrigger = true;
    // [SVG]
    let ownerSvg;
    // SVGElement which is not root view
    if (element instanceof SVGElement && (ownerSvg = element.ownerSVGElement)) {
      // It means `instanceof SVGLocatable` (many browsers don't have SVGLocatable)
      if (!element.getBBox) { throw new Error('This element is not accepted. (SVGLocatable)'); }
      // Trident and Edge bug, SVGSVGElement doesn't have SVGAnimatedTransformList?
      if (!element.transform) {
        throw new Error('This element is not accepted. (SVGAnimatedTransformList)');
      }
      // Trident bug, returned value must be used (That is not given value).
      props.svgTransform = element.transform.baseVal.appendItem(ownerSvg.createSVGTransform());
      props.svgPoint = ownerSvg.createSVGPoint();
      // Gecko bug, view.getScreenCTM returns CTM with root view.
      const svgView = element.nearestViewportElement;
      props.svgCtmElement = !IS_GECKO ? svgView :
        svgView.appendChild(document.createElementNS(ownerSvg.namespaceURI, 'rect'));
      gpuTrigger = false;
      props.initElm = initSvg;
      props.moveElm = moveSvg;

    } else {
    // [/SVG]
    /* eslint-disable indent */ /* [SVG/] */
    const cssPropWillChange = CSSPrefix.getName('willChange');
    if (cssPropWillChange) { gpuTrigger = false; }

    if (!options.leftTop && cssPropTransform) { // translate
      if (cssPropWillChange) { element.style[cssPropWillChange] = 'transform'; }
      props.initElm = initTranslate;
      props.moveElm = moveTranslate;

    } else { // left and top
      // [LEFTTOP]
      if (cssPropWillChange) { element.style[cssPropWillChange] = 'left, top'; }
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
    if (draggableClass) { mClassList(element).add(draggableClass); }
    props.pointerEventHandlerId =
      pointerEvent.regStartHandler(pointerXY => dragStart(props, pointerXY));

    // Default options
    if (!options.containment) {
      let parent;
      options.containment = (parent = element.parentNode) && isElement(parent) ? parent : body;
    }
    if (!options.handle) { options.handle = element; }

    setOptions(props, options);
  }

  remove() {
    const props = insProps[this._id];
    this.disabled = true; // To restore element and reset pointer
    pointerEvent.unregStartHandler(
      pointerEvent.removeStartHandler(props.options.handle, props.pointerEventHandlerId));
    delete insProps[this._id];
  }

  /**
   * @param {Object} options - New options.
   * @returns {PlainDraggable} Current instance itself.
   */
  setOptions(options) {
    if (isObject(options)) {
      setOptions(insProps[this._id], options);
    }
    return this;
  }

  position() {
    initBBox(insProps[this._id]);
    return this;
  }

  get disabled() {
    return insProps[this._id].disabled;
  }
  set disabled(value) {
    const props = insProps[this._id];
    if ((value = !!value) !== props.disabled) {
      props.disabled = value;
      if (props.disabled) {
        if (props === activeProps) { dragEnd(props); }
        props.options.handle.style.cursor = props.orgCursor;
        if (cssPropUserSelect) { props.options.handle.style[cssPropUserSelect] = props.orgUserSelect; }
        if (draggableClass) { mClassList(props.element).remove(draggableClass); }
      } else {
        setDraggableCursor(props.options.handle, props.orgCursor);
        if (cssPropUserSelect) { props.options.handle.style[cssPropUserSelect] = 'none'; }
        if (draggableClass) { mClassList(props.element).add(draggableClass); }
      }
    }
  }

  get element() {
    return insProps[this._id].element;
  }

  get rect() {
    return copyTree(insProps[this._id].elementBBox);
  }

  get left() { return insProps[this._id].elementBBox.left; }
  set left(value) { setOptions(insProps[this._id], {left: value}); }

  get top() { return insProps[this._id].elementBBox.top; }
  set top(value) { setOptions(insProps[this._id], {top: value}); }

  get containment() {
    const props = insProps[this._id];
    return props.containmentIsBBox
      ? ppBBox2OptionObject(props.options.containment) : props.options.containment;
  }
  set containment(value) { setOptions(insProps[this._id], {containment: value}); }

  // [SNAP]
  get snap() { return copyTree(insProps[this._id].options.snap); }
  set snap(value) { setOptions(insProps[this._id], {snap: value}); }
  // [/SNAP]

  // [AUTO-SCROLL]
  get autoScroll() { return copyTree(insProps[this._id].options.autoScroll); }
  set autoScroll(value) { setOptions(insProps[this._id], {autoScroll: value}); }
  // [/AUTO-SCROLL]

  get handle() { return insProps[this._id].options.handle; }
  set handle(value) { setOptions(insProps[this._id], {handle: value}); }

  get zIndex() { return insProps[this._id].options.zIndex; }
  set zIndex(value) { setOptions(insProps[this._id], {zIndex: value}); }

  get onDrag() { return insProps[this._id].options.onDrag; }
  set onDrag(value) { setOptions(insProps[this._id], {onDrag: value}); }

  get onMove() { return insProps[this._id].options.onMove; }
  set onMove(value) { setOptions(insProps[this._id], {onMove: value}); }

  get onDragStart() { return insProps[this._id].options.onDragStart; }
  set onDragStart(value) { setOptions(insProps[this._id], {onDragStart: value}); }

  get onMoveStart() { return insProps[this._id].options.onMoveStart; }
  set onMoveStart(value) { setOptions(insProps[this._id], {onMoveStart: value}); }

  get onDragEnd() { return insProps[this._id].options.onDragEnd; }
  set onDragEnd(value) { setOptions(insProps[this._id], {onDragEnd: value}); }

  static get draggableCursor() {
    return cssWantedValueDraggableCursor;
  }
  static set draggableCursor(value) {
    if (cssWantedValueDraggableCursor !== value) {
      cssWantedValueDraggableCursor = value;
      cssValueDraggableCursor = null; // Reset
      Object.keys(insProps).forEach(id => {
        const props = insProps[id];
        if (props.disabled || props === activeProps && cssValueDraggingCursor !== false) { return; }
        setDraggableCursor(props.options.handle, props.orgCursor);
        if (props === activeProps) { // Since cssValueDraggingCursor is `false`, copy cursor again.
          body.style.cursor = cssOrgValueBodyCursor;
          body.style.cursor = window.getComputedStyle(props.options.handle, '').cursor;
        }
      });
    }
  }

  static get draggingCursor() {
    return cssWantedValueDraggingCursor;
  }
  static set draggingCursor(value) {
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

  static get draggableClass() {
    return draggableClass;
  }
  static set draggableClass(value) {
    value = value ? (value + '') : void 0;
    if (value !== draggableClass) {
      Object.keys(insProps).forEach(id => {
        const props = insProps[id];
        if (!props.disabled) {
          const classList = mClassList(props.element);
          if (draggableClass) { classList.remove(draggableClass); }
          if (value) { classList.add(value); }
        }
      });
      draggableClass = value;
    }
  }

  static get draggingClass() {
    return draggingClass;
  }
  static set draggingClass(value) {
    value = value ? (value + '') : void 0;
    if (value !== draggingClass) {
      if (activeProps) {
        const classList = mClassList(activeProps.element);
        if (draggingClass) { classList.remove(draggingClass); }
        if (value) { classList.add(value); }
      }
      draggingClass = value;
    }
  }

  static get movingClass() {
    return movingClass;
  }
  static set movingClass(value) {
    value = value ? (value + '') : void 0;
    if (value !== movingClass) {
      if (activeProps && hasMoved) {
        const classList = mClassList(activeProps.element);
        if (movingClass) { classList.remove(movingClass); }
        if (value) { classList.add(value); }
      }
      movingClass = value;
    }
  }
}

pointerEvent.addMoveHandler(document, pointerXY => {
  if (!activeProps) { return; }
  const position = {
    left: pointerXY.clientX + window.pageXOffset + pointerOffset.left,
    top: pointerXY.clientY + window.pageYOffset + pointerOffset.top
  };
  if (move(activeProps, position,
    // [SNAP]
    activeProps.snapTargets ? position => { // Snap
      const iLen = activeProps.snapTargets.length;
      let snappedX = false,
        snappedY = false,
        i;
      for (i = 0; i < iLen && (!snappedX || !snappedY); i++) {
        const snapTarget = activeProps.snapTargets[i];
        if ((snapTarget.gravityXStart == null || position.left >= snapTarget.gravityXStart) &&
            (snapTarget.gravityXEnd == null || position.left <= snapTarget.gravityXEnd) &&
            (snapTarget.gravityYStart == null || position.top >= snapTarget.gravityYStart) &&
            (snapTarget.gravityYEnd == null || position.top <= snapTarget.gravityYEnd)) {
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
    } :
    // [/SNAP]
    activeProps.onDrag)) {

    // [AUTO-SCROLL]
    const xyMoveArgs = {},
      autoScroll = activeProps.autoScroll;
    if (autoScroll) {
      const clientXY = {
        x: activeProps.elementBBox.left - window.pageXOffset,
        y: activeProps.elementBBox.top - window.pageYOffset
      };

      ['x', 'y'].forEach(axis => {
        if (autoScroll[axis]) {
          const min = autoScroll[axis].min,
            max = autoScroll[axis].max;
          autoScroll[axis].lines.some(line => {
            if (line.dir === -1 ? (clientXY[axis] <= line.position) :
              (clientXY[axis] >= line.position)) {
              xyMoveArgs[axis] = {dir: line.dir, speed: line.speed / 1000, min, max};
              return true;
            }
            return false;
          });
        }
      });
    }
    if (xyMoveArgs.x || xyMoveArgs.y) {
      scrollFrame.move(autoScroll.target, xyMoveArgs,
        autoScroll.isWindow ? scrollXYWindow : scrollXYElement);
      position.autoScroll = true;
    } else {
      scrollFrame.stop();
    }
    // [/AUTO-SCROLL]

    if (!hasMoved) {
      hasMoved = true;
      if (movingClass) { mClassList(activeProps.element).add(movingClass); }
      if (activeProps.onMoveStart) { activeProps.onMoveStart(position); }
    }
    if (activeProps.onMove) { activeProps.onMove(position); }
  }
});

{
  function endHandler() {
    if (activeProps) { dragEnd(activeProps); }
  }

  pointerEvent.addEndHandler(document, endHandler);
  pointerEvent.addCancelHandler(document, endHandler);
}

{
  function initDoc() {
    cssPropTransitionProperty = CSSPrefix.getName('transitionProperty');
    cssPropTransform = CSSPrefix.getName('transform');
    cssOrgValueBodyCursor = body.style.cursor;
    if ((cssPropUserSelect = CSSPrefix.getName('userSelect'))) {
      cssOrgValueBodyUserSelect = body.style[cssPropUserSelect];
    }

    // Init active item when layout is changed, and init others later.

    const LAZY_INIT_DELAY = 200;
    let initDoneItems = {},
      lazyInitTimer;

    function checkInitBBox(props, eventType) {
      if (props.initElm) { // Easy checking for instance without errors.
        initBBox(props, eventType);
      } // eslint-disable-line brace-style
    }

    function initAll(eventType) {
      clearTimeout(lazyInitTimer);
      Object.keys(insProps).forEach(id => {
        if (!initDoneItems[id]) { checkInitBBox(insProps[id], eventType); }
      });
      initDoneItems = {};
    }

    let layoutChanging = false; // Gecko bug, multiple calling by `resize`.
    const layoutChange = AnimEvent.add(event => {
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
      lazyInitTimer = setTimeout(() => { initAll(event.type); }, LAZY_INIT_DELAY);

      layoutChanging = false;
    });
    window.addEventListener('resize', layoutChange, true);
    window.addEventListener('scroll', layoutChange, true);
  }

  if ((body = document.body)) {
    initDoc();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      body = document.body;
      initDoc();
    }, true);
  }
}

/* [SNAP/]
PlainDraggable.limit = true;
[SNAP/] */

export default PlainDraggable;
