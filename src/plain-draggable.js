/*
 * PlainDraggable
 * https://anseki.github.io/plain-draggable/
 *
 * Copyright (c) 2017 anseki
 * Licensed under the MIT license.
 */

import CSSPrefix from 'cssprefix';
import AnimEvent from 'anim-event';

const
  ZINDEX = 99999,
  SNAP_GRAVITY = 20, SNAP_CORNER = 'tl', SNAP_SIDE = 'both', SNAP_EDGE = 'both', SNAP_BASE = 'containment',
  SNAP_ALL_CORNERS = ['tl', 'tr', 'bl', 'br'],
  SNAP_ALL_SIDES = ['start', 'end'],
  SNAP_ALL_EDGES = ['inside', 'outside'],

  IS_WEBKIT = !window.chrome && 'WebkitAppearance' in document.documentElement.style,

  isObject = (() => {
    const toString = {}.toString, fnToString = {}.hasOwnProperty.toString,
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
  insProps = {};

let insId = 0,
  activeItem, hasMoved, pointerOffset, body,
  // CSS property/value
  cssValueCursorDraggable, cssValueCursorDragging,
  cssOrgValueCursor, cssPropUserSelect, cssOrgValueUserSelect,
  // Try to set `cursor` property.
  cssWantedValueCursorDraggable = IS_WEBKIT ? ['all-scroll', 'move'] : ['grab', 'all-scroll', 'move'],
  cssWantedValueCursorDragging = IS_WEBKIT ? 'move' : ['grabbing', 'move'];

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
      typeA === 'obj' ?
        hasChanged((keysA = Object.keys(a).sort()), Object.keys(b).sort()) ||
          keysA.some(prop => hasChanged(a[prop], b[prop])) :
      typeA === 'array' ?
        a.length !== b.length || a.some((aVal, i) => hasChanged(aVal, b[i])) :
      a !== b
    );
}

/**
 * @param {Element} element - A target element.
 * @returns {boolean} - `true` if connected element.
 */
function isElement(element) {
  return !!(element &&
    element.nodeType === Node.ELEMENT_NODE &&
    // element instanceof HTMLElement &&
    typeof element.getBoundingClientRect === 'function' &&
    !(element.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED));
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
  if (!isObject(bBox)) { return null; }
  if (isFinite(bBox.left)) {
    bBox.x = bBox.left;
  } else if (isFinite(bBox.x)) {
    bBox.left = bBox.x;
  } else { return null; }
  if (isFinite(bBox.top)) {
    bBox.y = bBox.top;
  } else if (isFinite(bBox.y)) {
    bBox.top = bBox.y;
  } else { return null; }

  if (isFinite(bBox.width) && bBox.width >= 0) {
    bBox.right = bBox.left + bBox.width;
  } else if (isFinite(bBox.right) && bBox.right >= bBox.left) {
    bBox.width = bBox.right - bBox.left;
  } else { return null; }
  if (isFinite(bBox.height) && bBox.height >= 0) {
    bBox.bottom = bBox.top + bBox.height;
  } else if (isFinite(bBox.bottom) && bBox.bottom >= bBox.top) {
    bBox.height = bBox.bottom - bBox.top;
  } else { return null; }
  return bBox;
}
window.validBBox = validBBox; // [DEBUG/]

/**
 * @param {Element} element - A target element.
 * @param {boolean} [getPaddingBox] - Get padding-box instead of border-box as bounding-box.
 * @returns {BBox} - A bounding-box of `element`.
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
window.getBBox = getBBox; // [DEBUG/]

/**
 * Optimize an element for animation.
 * @param {Element} element - A target element.
 * @returns {Element} - A target element.
 */
function initAnim(element) {
  const style = element.style;
  style.webkitTapHighlightColor = 'transparent';
  style[CSSPrefix.getProp('transform', element)] = 'translateZ(0)';
  style[CSSPrefix.getProp('boxShadow', element)] = '0 0 1px transparent';
  return element;
}

function setCursorDraggable(element) {
  if (cssValueCursorDraggable == null) {
    cssValueCursorDraggable = CSSPrefix.setValue(element, 'cursor', cssWantedValueCursorDraggable);
  } else {
    element.style.cursor = cssValueCursorDraggable;
  }
}

function setCursorDragging(element) {
  if (cssValueCursorDragging == null) {
    cssValueCursorDragging = CSSPrefix.setValue(element, 'cursor', cssWantedValueCursorDragging);
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

  const elementStyle = props.elementStyle, offset = props.offset;
  let moved = false;
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
    props.elementBBox = validBBox({left: position.left, top: position.top,
      width: elementBBox.width, height: elementBBox.height});
  }

  return moved;
}

/**
 * Set `elementBBox`, `containmentBBox` and `min/max``Left/Top`.
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function initBBox(props) {
  const element = props.element, elementStyle = props.elementStyle;

  // Get document offset.
  const curPosition = getBBox(element),
    RESTORE_PROPS = ['position', 'margin', 'width', 'height'];
  if (!props.orgStyle) {
    props.orgStyle = RESTORE_PROPS.reduce((orgStyle, prop) => {
      orgStyle[prop] = elementStyle[prop] || '';
      return orgStyle;
    }, {});
  } else {
    RESTORE_PROPS.forEach(prop => { elementStyle[prop] = props.orgStyle[prop]; });
  }
  const orgSize = getBBox(element);
  elementStyle.position = 'absolute';
  elementStyle.left = elementStyle.top = elementStyle.margin = '0';
  let newBBox = getBBox(element);
  const offset = props.offset =
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
      if (newBBox[prop] !== orgSize[prop]) {
        elementStyle[prop] = orgSize[prop] - (newBBox[prop] - orgSize[prop]) + 'px';
      }
    }
  });

  const elementBBox = props.elementBBox = getBBox(element),
    containmentBBox = props.containmentBBox =
      props.containmentIsBBox ? props.options.containment : getBBox(props.options.containment, true),
    minLeft = props.minLeft = containmentBBox.left,
    maxLeft = props.maxLeft = containmentBBox.right - elementBBox.width,
    minTop = props.minTop = containmentBBox.top,
    maxTop = props.maxTop = containmentBBox.bottom - elementBBox.height;
  // Adjust position
  move(props, {left: elementBBox.left, top: elementBBox.top});

  /**
   * @typedef {Object} SnapTarget
   * @property {number} [x] - A coordinate it moves to. It must have x or y or both.
   * @property {number} [y]
   * @property {number} [gravityXStart] - Gravity zone. It must have *Start or *End or both, and *X* or *Y* or both.
   * @property {number} [gravityXEnd]
   * @property {number} [gravityYStart]
   * @property {number} [gravityYEnd]
   */

  // snap targets
  if (props.parsedSnapTargets) {
    const docRect = document.documentElement.getBoundingClientRect(),
      elementSizeXY = {x: elementBBox.width, y: elementBBox.height},
      minXY = {x: minLeft, y: minTop}, maxXY = {x: maxLeft, y: maxTop},
      bBoxProp2Axis = {left: 'x', right: 'x', x: 'x', width: 'x',
        top: 'y', bottom: 'y', y: 'y', height: 'y'},

      snapTargets = props.parsedSnapTargets.reduce((snapTargets, parsedSnapTarget) => {
        const baseRect = parsedSnapTarget.base === 'containment' ? containmentBBox : docRect,
          baseOriginXY = {x: baseRect.left, y: baseRect.top},
          baseSizeXY = {x: baseRect.width, y: baseRect.height};

        /**
         * Basically, shallow copy from parsedSnapTarget.
         * @typedef {{x: (number|SnapValue), y, xStart, xEnd, xStep, yStart, yEnd, yStep}} TargetXY
         * @property {string[]} [corners]
         * @property {string[]} [sides]
         * @property {boolean} center
         */

        function resolvedValue(snapValue, baseOrigin, baseSize) {
          return typeof snapValue === 'number' ? snapValue :
            baseOrigin + snapValue.value * (snapValue.isRatio ? baseSize : 1);
        }

        // Add single Point or Line (targetXY has no *Step)
        function addSnapTarget(targetXY) {
          const center = typeof targetXY.center === 'boolean' ? targetXY.center : parsedSnapTarget.center;
          if (targetXY.x != null && targetXY.y != null) { // Point
            targetXY.x = resolvedValue(targetXY.x, baseOriginXY.x, baseSizeXY.x);
            targetXY.y = resolvedValue(targetXY.y, baseOriginXY.y, baseSizeXY.y);

            if (center) {
              targetXY.x -= elementSizeXY.x / 2;
              targetXY.y -= elementSizeXY.y / 2;
              targetXY.corners = ['tl'];
            }

            (targetXY.corners || parsedSnapTarget.corners).forEach(corner => {
              const x = targetXY.x - (corner === 'tr' || corner === 'br' ? elementSizeXY.x : 0),
                y = targetXY.y - (corner === 'bl' || corner === 'br' ? elementSizeXY.y : 0);
              if (x >= minXY.x && x <= maxXY.x && y >= minXY.y && y <= maxXY.y) {
                const snapTarget = {x: x, y: y},
                  gravityXStart = x - parsedSnapTarget.gravity,
                  gravityXEnd = x + parsedSnapTarget.gravity,
                  gravityYStart = y - parsedSnapTarget.gravity,
                  gravityYEnd = y + parsedSnapTarget.gravity;
                if (gravityXStart > minXY.x) { snapTarget.gravityXStart = gravityXStart; }
                if (gravityXEnd < maxXY.x) { snapTarget.gravityXEnd = gravityXEnd; }
                if (gravityYStart > minXY.y) { snapTarget.gravityYStart = gravityYStart; }
                if (gravityYEnd < maxXY.y) { snapTarget.gravityYEnd = gravityYEnd; }
                snapTargets.push(snapTarget);
              }
            });

          } else { // Line
            const specAxis = targetXY.x != null ? 'x' : 'y', rangeAxis = specAxis === 'x' ? 'y' : 'x',
              startProp = `${rangeAxis}Start`, endProp = `${rangeAxis}End`,
              specAxisL = specAxis.toUpperCase(), rangeAxisL = rangeAxis.toUpperCase(),
              gravitySpecStartProp = `gravity${specAxisL}Start`,
              gravitySpecEndProp = `gravity${specAxisL}End`,
              gravityRangeStartProp = `gravity${rangeAxisL}Start`,
              gravityRangeEndProp = `gravity${rangeAxisL}End`;
            targetXY[specAxis] =
              resolvedValue(targetXY[specAxis], baseOriginXY[specAxis], baseSizeXY[specAxis]);
            targetXY[startProp] =
              resolvedValue(targetXY[startProp], baseOriginXY[rangeAxis], baseSizeXY[rangeAxis]);
            targetXY[endProp] =
              resolvedValue(targetXY[endProp], baseOriginXY[rangeAxis], baseSizeXY[rangeAxis]) -
              elementSizeXY[rangeAxis]; // Reduce the end of the line.
            if (targetXY[startProp] > targetXY[endProp]) { return; } // Smaller than element size.

            if (center) {
              targetXY[specAxis] -= elementSizeXY[specAxis] / 2;
              targetXY.sides = ['start'];
            }

            (targetXY.sides || parsedSnapTarget.sides).forEach(side => {
              const xy = targetXY[specAxis] - (side === 'end' ? elementSizeXY[specAxis] : 0);
              if (xy >= minXY[specAxis] && xy <= maxXY[specAxis]) {
                const snapTarget = {},
                  gravitySpecStart = xy - parsedSnapTarget.gravity,
                  gravitySpecEnd = xy + parsedSnapTarget.gravity;
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
        if ((bBox = parsedSnapTarget.element ? getBBox(parsedSnapTarget.element) : // Element
            parsedSnapTarget.snapBBox ? // SnapBBox
              validBBox(Object.keys(parsedSnapTarget.snapBBox).reduce((bBox, prop) => {
                bBox[prop] = resolvedValue(parsedSnapTarget.snapBBox[prop],
                  prop === 'width' || prop === 'height' ? 0 : baseOriginXY[bBoxProp2Axis[prop]],
                  baseSizeXY[bBoxProp2Axis[prop]]);
                return bBox;
              }, {})) : null)) {
          // Expand into 4 lines.
          parsedSnapTarget.edges.forEach(edge => {
            const lengthenX = edge === 'outside' ? elementBBox.width : 0,
              lengthenY = edge === 'outside' ? elementBBox.height : 0,
              xStart = bBox.left - lengthenX, xEnd = bBox.right + lengthenX,
              yStart = bBox.top - lengthenY, yEnd = bBox.bottom + lengthenY;
            let side = edge === 'inside' ? 'start' : 'end';
            addSnapTarget({xStart: xStart, xEnd: xEnd, y: bBox.top, sides: [side], center: false}); // Top
            addSnapTarget({x: bBox.left, yStart: yStart, yEnd: yEnd, sides: [side], center: false}); // Left
            side = edge === 'inside' ? 'end' : 'start';
            addSnapTarget({xStart: xStart, xEnd: xEnd, y: bBox.bottom, sides: [side], center: false}); // Bottom
            addSnapTarget({x: bBox.right, yStart: yStart, yEnd: yEnd, sides: [side], center: false}); // Right
          });

        } else {

          addSnapTarget(
            ['x', 'y', 'xStart', 'xEnd', 'yStart', 'yEnd'].reduce((targetXY, prop) => {
              targetXY[prop] = parsedSnapTarget[prop]; // Shallow copy
              return targetXY;
            }, {}));
        }

        return snapTargets;
      }, []);

    props.snapTargets = snapTargets.length ? snapTargets : null;
  }

  window.initBBoxDone = true; // [DEBUG/]

        // points.sort((a, b) => a - b);
        // let lastPoint = -2;
        // points = points.filter(point => {
        //   if (point - lastPoint >= 2) {
        //     lastPoint = point;
        //     return true;
        //   }
        //   return false;
        // });
}

function mousedown(props, event) {
  if (props.disabled) { return; }

  setCursorDragging(props.options.handle);
  if (props.options.zIndex !== false) { props.elementStyle.zIndex = props.options.zIndex; }
  setCursorDragging(body);
  if (cssPropUserSelect) { body.style[cssPropUserSelect] = 'none'; }

  activeItem = props;
  hasMoved = false;
  pointerOffset = {left: props.elementBBox.left - event.pageX, top: props.elementBBox.top - event.pageY};
}

function dragEnd(props) {
  setCursorDraggable(props.options.handle);
  if (props.options.zIndex !== false) { props.elementStyle.zIndex = props.orgZIndex; }
  body.style.cursor = cssOrgValueCursor;
  if (cssPropUserSelect) { body.style[cssPropUserSelect] = cssOrgValueUserSelect; }

  activeItem = null;
  if (props.onDragEnd) { props.onDragEnd(); }
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
    } else if ((bBox = validBBox(copyTree(newOptions.containment))) && // bBox
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
   * @property {(Element|Object)} [target] - Properties of Object are string or number from SnapBBox.
   * @property {number} [gravity]
   * @property {string} [corner]
   * @property {string} [side]
   * @property {boolean} [center]
   * @property {string} [edge]
   * @property {string} [base]
   */

  /**
   * @typedef {{value: number, isRatio: boolean}} SnapValue
   */

  /**
   * An object that simulates BBox but properties are SnapValue.
   * @typedef {Object} SnapBBox
   */

  /**
   * @typedef {Object} ParsedSnapTarget
   * @property {SnapValue} [x] - (input: pixels | '<n>%')
   * @property {SnapValue} [y]
   * @property {SnapValue} [xStart] - (input: {start, end} | {step, start, end})
   * @property {SnapValue} [xEnd]
   * @property {SnapValue} [xStep] - (input: {step, start, end})
   * @property {SnapValue} [yStart]
   * @property {SnapValue} [yEnd]
   * @property {SnapValue} [yStep]
   * @property {Element} [element]
   * @property {SnapBBox} [snapBBox]
   * @property {number} gravity
   * @property {string[]} corners
   * @property {string[]} sides
   * @property {boolean} center
   * @property {string[]} edges
   * @property {string} base
   */

  // Get SnapValue from string (all `/s` were already removed)
  function string2SnapValue(text) {
    const matches = /^(.+?)(\%)?$/.exec(text);
    let value, isRatio;
    return matches && isFinite((value = parseFloat(matches[1]))) ?
      {value: (isRatio = !!(matches[2] && value)) ? value / 100 : value, isRatio: isRatio} : null; // 0% -> 0
  }

  function snapValue2value(snapValue) {
    return snapValue.isRatio ? `${snapValue.value * 100}%` : snapValue.value;
  }
  window.snapValue2value = snapValue2value; // [DEBUG/]

  function validSnapValue(value) {
    return isFinite(value) ? {value: value, isRatio: false} :
      typeof value === 'string' ? string2SnapValue(value.replace(/\s/g, '')) : null;
  }
  window.validSnapValue = validSnapValue; // [DEBUG/]

  function validSnapBBox(bBox) {
    if (!isObject(bBox)) { return null; }
    let snapValue;
    if ((snapValue = validSnapValue(bBox.left)) || (snapValue = validSnapValue(bBox.x))) {
      bBox.left = bBox.x = snapValue;
    } else { return null; }
    if ((snapValue = validSnapValue(bBox.top)) || (snapValue = validSnapValue(bBox.y))) {
      bBox.top = bBox.y = snapValue;
    } else { return null; }

    if ((snapValue = validSnapValue(bBox.width)) && snapValue.value >= 0) {
      bBox.width = snapValue;
      delete bBox.right;
    } else if ((snapValue = validSnapValue(bBox.right))) {
      bBox.right = snapValue;
      delete bBox.width;
    } else { return null; }
    if ((snapValue = validSnapValue(bBox.height)) && snapValue.value >= 0) {
      bBox.height = snapValue;
      delete bBox.bottom;
    } else if ((snapValue = validSnapValue(bBox.bottom))) {
      bBox.bottom = snapValue;
      delete bBox.height;
    } else { return null; }
    return bBox;
  }
  window.validSnapBBox = validSnapBBox; // [DEBUG/]

  // Initialize `gravity`, `corner`, `side`, `center`, `edge`, `base`
  function commonSnapOptions(options, newOptions) {
    // gravity
    if (isFinite(newOptions.gravity) && newOptions.gravity > 0) { options.gravity = newOptions.gravity; }
    // corner
    let corner = typeof newOptions.corner === 'string' ? newOptions.corner.trim().toLowerCase() : null;
    if (corner) {
      if (corner !== 'all') {
        const added = {},
          corners = corner.split(/\s/).reduce((corners, corner) => {
            corner = corner.trim().replace(/^(.).*?\-(.).*$/, '$1$2');
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
    const side = typeof newOptions.side === 'string' ? newOptions.side.trim().toLowerCase() : null;
    if (side && (side === 'start' || side === 'end' || side === 'both')) { options.side = side; }
    // center
    if (typeof newOptions.center === 'boolean') { options.center = newOptions.center; }
    // edge
    const edge = typeof newOptions.edge === 'string' ? newOptions.edge.trim().toLowerCase() : null;
    if (edge && (edge === 'inside' || edge === 'outside' || edge === 'both')) { options.edge = edge; }
    // base
    const base = typeof newOptions.base === 'string' ? newOptions.base.trim().toLowerCase() : null;
    if (base && (base === 'containment' || base === 'document')) { options.base = base; }
    return options;
  }
  window.commonSnapOptions = commonSnapOptions; // [DEBUG/]

  // snap
  if (newOptions.snap != null) {
    const newSnapOptions =
        isObject(newOptions.snap) && (newOptions.snap.targets != null) ? newOptions.snap :
        {targets: newOptions.snap},
      snapTargetsOptions = [],
      snapOptions = commonSnapOptions({targets: snapTargetsOptions}, newSnapOptions);

    // Set default options in top level.
    if (!snapOptions.gravity) { snapOptions.gravity = SNAP_GRAVITY; }
    if (!snapOptions.corner) { snapOptions.corner = SNAP_CORNER; }
    if (!snapOptions.side) { snapOptions.side = SNAP_SIDE; }
    if (typeof snapOptions.center !== 'boolean') { snapOptions.center = false; }
    if (!snapOptions.edge) { snapOptions.edge = SNAP_EDGE; }
    if (!snapOptions.base) { snapOptions.base = SNAP_BASE; }

    const parsedSnapTargets = (
        Array.isArray(newSnapOptions.targets) ? newSnapOptions.targets : [newSnapOptions.targets]
      ).reduce((parsedSnapTargets, target) => {

        function snapBBox2Object(snapBBox) {
          return Object.keys(snapBBox).reduce((obj, prop) => {
            obj[prop] = snapValue2value(snapBBox[prop]);
            return obj;
          }, {});
        }

        if (target == null) { return parsedSnapTargets; }

        const isElementPre = isElement(target), // Pre-check direct value
          snapBBoxPre = validSnapBBox(copyTree(target)), // Pre-check direct value
          newSnapTargetOptions =
            isElementPre || snapBBoxPre ? {target: target} : // Direct Element | SnapBBox
            isObject(target) &&
              target.start == null && target.end == null && target.step == null ? target : // SnapTargetOptions
            {x: target, y: target}, // Others, it might be {step, start, end}
          expandedParsedSnapTargets = [],
          snapTargetOptions = {},
          newOptionsTarget = newSnapTargetOptions.target;
        let snapBBox;

        if (isElementPre || isElement(newOptionsTarget)) { // Element
          expandedParsedSnapTargets.push({element: newOptionsTarget});
          snapTargetOptions.target = newOptionsTarget;
        } else if ((snapBBox = snapBBoxPre || validSnapBBox(copyTree(newOptionsTarget)))) { // Object -> SnapBBox
          expandedParsedSnapTargets.push({snapBBox: snapBBox});
          snapTargetOptions.target = snapBBox2Object(snapBBox);

        } else {
          const parsedXY = ['x', 'y'].reduce((parsedXY, axis) => {
            const newOptionsXY = newSnapTargetOptions[axis];
            let snapValue;

            if ((snapValue = validSnapValue(newOptionsXY))) { // pixels | '<n>%'
              parsedXY[axis] = snapValue;
              snapTargetOptions[axis] = snapValue2value(snapValue);

            } else { // {start, end} | {step, start, end}
              let start, end, step;
              if (isObject(newOptionsXY)) {
                start = validSnapValue(newOptionsXY.start);
                end = validSnapValue(newOptionsXY.end);
                step = validSnapValue(newOptionsXY.step);
                if (start && end && start.isRatio === end.isRatio && start.value >= end.value) { // start >= end
                  start = end = null;
                }
              }
              start = parsedXY[`${axis}Start`] = start || {value: 0, isRatio: false};
              end = parsedXY[`${axis}End`] = end || {value: 1, isRatio: true};
              snapTargetOptions[axis] =
                {start: snapValue2value(start), end: snapValue2value(end)};
              if (step && (step.isRatio ? step.value > 0 : step.value >= 2)) { // step > 0% || step >= 2px
                parsedXY[`${axis}Step`] = step;
                snapTargetOptions[axis].step = snapValue2value(step);
              }
            }
            return parsedXY;
          }, {});

          if (parsedXY.xStart && !parsedXY.xStep && parsedXY.yStart && !parsedXY.yStep) {
            // Expand into 4 lines.
            expandedParsedSnapTargets.push(
              {xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yStart}, // Top
              {xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yEnd}, // Bottom
              {x: parsedXY.xStart, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd}, // Left
              {x: parsedXY.xEnd, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd} // Right
            );
          } else {
            let expanded = [parsedXY];
            ['x', 'y'].forEach(axis => {
              expanded = expanded.reduce((expanded, parsedXY) => {
                const step = parsedXY[`${axis}Step`],
                  start = parsedXY[`${axis}Start`], end = parsedXY[`${axis}End`];
                if (step && (!start.value || start.isRatio === step.isRatio) &&
                    (!end.value || end.isRatio === step.isRatio)) {
                  // Expand by step
                  let curValue = start.value;
                  while (curValue <= end.value) {
                    const expandedXY = copyTree(parsedXY);
                    delete expandedXY[`${axis}Step`];
                    delete expandedXY[`${axis}Start`];
                    delete expandedXY[`${axis}End`];
                    expandedXY[axis] = {value: curValue, isRatio: !!curValue && step.isRatio};
                    expanded.push(expandedXY);
                    curValue += step.value;
                  }
                } else {
                  expanded.push(parsedXY);
                }
                return expanded;
              }, []);
            });
            Array.prototype.push.apply(expandedParsedSnapTargets, expanded);
          }
        }

        if (expandedParsedSnapTargets.length) {
          snapTargetsOptions.push(commonSnapOptions(snapTargetOptions, newSnapTargetOptions));
          // Copy common SnapOptions
          const
            corner = snapTargetOptions.corner || snapOptions.corner,
            side = snapTargetOptions.side || snapOptions.side,
            edge = snapTargetOptions.edge || snapOptions.edge,
            commonOptions = {
              gravity: snapTargetOptions.gravity || snapOptions.gravity,
              base: snapTargetOptions.base || snapOptions.base,
              center: typeof snapTargetOptions.center === 'boolean' ?
                snapTargetOptions.center : snapOptions.center,
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

  if (needsInitBBox) { initBBox(props); }

  // Gecko, Trident pick drag-event of some elements such as img, a, etc.
  function dragstart(event) { event.preventDefault(); }

  // handle
  if (isElement(newOptions.handle) && newOptions.handle !== options.handle) {
    if (options.handle) { // Restore
      options.handle.style.cursor = props.orgCursor;
      options.handle.removeEventListener('dragstart', dragstart, false);
      options.handle.removeEventListener('mousedown', props.handleMousedown, false);
    }
    const handle = options.handle = newOptions.handle;
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
  ['onDrag', 'onMove', 'onMoveStart', 'onDragEnd'].forEach(option => {
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

    props.element = initAnim(element);
    props.elementStyle = element.style;
    props.orgZIndex = props.elementStyle.zIndex;
    // Event listeners for handle element, to be removed.
    props.handleMousedown = event => { mousedown(props, event); };

    // Gecko bug, multiple calling (parallel) by `requestAnimationFrame`.
    props.resizing = false;
    window.addEventListener('resize', AnimEvent.add(() => {
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
      let parent;
      options.containment = (parent = element.parentNode) && isElement(parent) ? parent : body;
    }
    if (!options.handle) { options.handle = element; }

    setOptions(props, options);
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
    value = !!value;
    if (value !== props.disabled) {
      props.disabled = value;
      if (props.disabled) {
        if (props === activeItem) { dragEnd(props); }
        props.options.handle.style.cursor = props.orgCursor;
      } else {
        setCursorDraggable(props.options.handle);
      }
    }
  }

  get element() {
    return insProps[this._id].element;
  }

  get bBox() {
    return copyTree(insProps[this._id].elementBBox);
  }

  get left() { return insProps[this._id].elementBBox.left; }
  set left(value) { setOptions(insProps[this._id], {left: value}); }

  get top() { return insProps[this._id].elementBBox.top; }
  set top(value) { setOptions(insProps[this._id], {top: value}); }

  get containment() {
    const props = insProps[this._id];
    return props.containmentIsBBox ? copyTree(props.options.containment) : props.options.containment;
  }
  set containment(value) { setOptions(insProps[this._id], {containment: value}); }

  get snap() { return copyTree(insProps[this._id].options.snap); }
  set snap(value) { setOptions(insProps[this._id], {snap: value}); }

  get handle() { return insProps[this._id].options.handle; }
  set handle(value) { setOptions(insProps[this._id], {handle: value}); }

  get zIndex() { return insProps[this._id].options.zIndex; }
  set zIndex(value) { setOptions(insProps[this._id], {zIndex: value}); }

  get onDrag() { return insProps[this._id].options.onDrag; }
  set onDrag(value) { setOptions(insProps[this._id], {onDrag: value}); }

  get onMove() { return insProps[this._id].options.onMove; }
  set onMove(value) { setOptions(insProps[this._id], {onMove: value}); }

  get onMoveStart() { return insProps[this._id].options.onMoveStart; }
  set onMoveStart(value) { setOptions(insProps[this._id], {onMoveStart: value}); }

  get onDragEnd() { return insProps[this._id].options.onDragEnd; }
  set onDragEnd(value) { setOptions(insProps[this._id], {onDragEnd: value}); }

  static get cursorDraggable() {
    return cssWantedValueCursorDraggable;
  }
  static set cursorDraggable(value) {
    cssWantedValueCursorDraggable = value;
    // Reset
    cssValueCursorDraggable = null;
    Object.keys(insProps).forEach(id =>{
      const props = insProps[id];
      if (!props.disabled && props !== activeItem) {
        setCursorDraggable(props.options.handle);
      }
    });
  }

  static get cursorDragging() {
    return cssWantedValueCursorDragging;
  }
  static set cursorDragging(value) {
    cssWantedValueCursorDragging = value;
    // Reset
    cssValueCursorDragging = null;
    if (activeItem) {
      setCursorDragging(activeItem.options.handle);
    }
  }
}

document.addEventListener('mousemove', AnimEvent.add(event => {
  if (activeItem &&
      move(activeItem, {
        left: event.pageX + pointerOffset.left,
        top: event.pageY + pointerOffset.top
      },
      activeItem.snapTargets ? position => { // Snap
        let snappedX = false, snappedY = false, i, iLen = activeItem.snapTargets.length;
        for (i = 0; i < iLen && (!snappedX || !snappedY); i++) {
          const snapTarget = activeItem.snapTargets[i];
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
        return activeItem.onDrag ? activeItem.onDrag(position) : true;
      } : activeItem.onDrag)) {

    if (!hasMoved) {
      hasMoved = true;
      if (activeItem.onMoveStart) { activeItem.onMoveStart(); }
    }
    if (activeItem.onMove) { activeItem.onMove(); }
  }
}), false);

document.addEventListener('mouseup', () => { // It might occur outside body.
  if (activeItem) { dragEnd(activeItem); }
}, false);

{
  function initBody() {
    cssOrgValueCursor = body.style.cursor;
    if ((cssPropUserSelect = CSSPrefix.getProp('userSelect', body))) {
      cssOrgValueUserSelect = body.style[cssPropUserSelect];
    }
  }

  if ((body = document.body)) {
    initBody();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      body = document.body;
      initBody();
    }, false);
  }
}

export default PlainDraggable;
