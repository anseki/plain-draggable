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
  SNAP_GRAVITY = 20, SNAP_EDGE = 'both', SNAP_BASE = 'containment', SNAP_SIDE = 'both',

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
window.SNAP_EDGE = SNAP_EDGE;
window.SNAP_BASE = SNAP_BASE;
window.SNAP_SIDE = SNAP_SIDE;
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
  position.left = props.minLeft >= props.maxLeft ? elementBBox.left : // Disabled
    position.left < props.minLeft ? props.minLeft :
    position.left > props.maxLeft ? props.maxLeft :
    position.left;
  position.top = props.minTop >= props.maxTop ? elementBBox.top : // Disabled
    position.top < props.minTop ? props.minTop :
    position.top > props.maxTop ? props.maxTop :
    position.top;

  if (cbCheck && cbCheck(position) === false) { return false; }

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
      props.containmentIsBBox ? props.options.containment : getBBox(props.options.containment, true);
  props.minLeft = containmentBBox.left;
  props.maxLeft = containmentBBox.right - elementBBox.width;
  props.minTop = containmentBBox.top;
  props.maxTop = containmentBBox.bottom - elementBBox.height;
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
    const docRect = document.documentElement.getBoundingClientRect();
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
   * @property {string} [edge]
   * @property {string} [base]
   * @property {string} [side]
   */

  /**
   * @typedef {Object} SnapTargetOptions
   * @property {(number|string)} [x] - pixels | '<n>%' | '<closed-interval>' | 'step:<n><closed-interval>'
   * @property {(number|string)} [y]
   * @property {(Element|Object)} [target] - Properties of Object are string or number from SnapBBox.
   * @property {number} [gravity]
   * @property {string} [edge]
   * @property {string} [base]
   * @property {string} [side]
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
   * @property {SnapValue} [xStart] - (input: '<closed-interval>' | 'step:<n><closed-interval>')
   * @property {SnapValue} [xEnd]
   * @property {SnapValue} [xStep] - (input: 'step:<n><closed-interval>')
   * @property {SnapValue} [yStart]
   * @property {SnapValue} [yEnd]
   * @property {SnapValue} [yStep]
   * @property {Element} [element]
   * @property {SnapBBox} [snapBBox]
   * @property {number} gravity
   * @property {string} edge
   * @property {string} base
   * @property {string} side
   */

  // Initialize `gravity`, `edge`, `base`, `side`
  function commonSnapOptions(options, newOptions) {
    // gravity
    if (isFinite(newOptions.gravity) && newOptions.gravity > 0) { options.gravity = newOptions.gravity; }
    // edge
    const edge = typeof newOptions.edge === 'string' ? newOptions.edge.toLowerCase() : null;
    if (edge && (edge === 'start' || edge === 'end' || edge === 'both')) { options.edge = edge; }
    // base
    const base = typeof newOptions.base === 'string' ? newOptions.base.toLowerCase() : null;
    if (base && (base === 'containment' || base === 'document')) { options.base = base; }
    // side
    const side = typeof newOptions.side === 'string' ? newOptions.side.toLowerCase() : null;
    if (side && (side === 'inner' || side === 'outer' || side === 'both')) { options.side = side; }
    return options;
  }

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

  // snap
  if (newOptions.snap != null) {
    const newSnapOptions =
        isObject(newOptions.snap) && (newOptions.snap.targets != null) ? newOptions.snap :
        {targets: newOptions.snap},

      snapTargetsOptions = [],
      parsedSnapTargets = (
          Array.isArray(newSnapOptions.targets) ? newSnapOptions.targets : [newSnapOptions.targets]
        ).reduce((parsedSnapTargets, target) => {
          if (target == null) { return parsedSnapTargets; }
          const parsedSnapTargetSplit = [];
          let newSnapTargetOptions = {}, snapTargetOptions, snapBBox;

          function snapBBox2Object(snapBBox) {
            return Object.keys(snapBBox).reduce((obj, prop) => {
              obj[prop] = snapValue2value(snapBBox[prop]);
              return obj;
            }, {});
          }

          // Validate `SnapTargetOptions`
          if (isElement(target)) { // Direct - Element
            parsedSnapTargetSplit.push({element: target});
            snapTargetOptions = {target: target};
          } else if ((snapBBox = validSnapBBox(copyTree(target)))) { // Direct - Object -> SnapBBox
            parsedSnapTargetSplit.push({snapBBox: snapBBox});
            snapTargetOptions = {target: snapBBox2Object(snapBBox)};

          } else {
            newSnapTargetOptions = isObject(target) ? target : {x: target, y: target};
            const newOptionsTarget = newSnapTargetOptions.target;

            if (isElement(newOptionsTarget)) { // Element
              parsedSnapTargetSplit.push({element: newOptionsTarget});
              snapTargetOptions = {target: newOptionsTarget};
            } else if ((snapBBox = validSnapBBox(copyTree(newOptionsTarget)))) { // Object -> SnapBBox
              parsedSnapTargetSplit.push({snapBBox: snapBBox});
              snapTargetOptions = {target: snapBBox2Object(snapBBox)};

            } else {
              const parsedXY = ['x', 'y'].reduce((parsedXY, axis) => {
                const newOptionsXY = newSnapTargetOptions[axis];
                let snapValue, matches;

                if (typeof newOptionsXY === 'string' &&
                    (matches = /^(?:step:(.+?))?(?:\[(.+)\])?$/i.exec(newOptionsXY.replace(/\s/g, ''))) &&
                    (matches[1] || matches[2])) {
                  // '<closed-interval>' | 'step:<n><closed-interval>'

                  const step = matches[1] ? string2SnapValue(matches[1]) : null, range = {};
                  if (matches[2]) { // Get range.
                    const rangeValues = matches[2].split(',');
                    ['start', 'end'].forEach((prop, i) => {
                      if (rangeValues[i] != null && (snapValue = string2SnapValue(rangeValues[i]))) {
                        range[prop] = snapValue;
                      }
                    });
                  }
                  if (!range.start) { range.start = {value: 0, isRatio: false}; }
                  if (!range.end) { range.end = {value: 1, isRatio: true}; }
                  if (range.start.isRatio === range.end.isRatio && range.start.value >= range.end.value) {
                    range.start = {value: 0, isRatio: false};
                    range.end = {value: 1, isRatio: true};
                  }

                  parsedXY[`${axis}Start`] = range.start;
                  parsedXY[`${axis}End`] = range.end;
                  if (step && (step.isRatio ? step.value > 0 : step.value >= 2)) { // step > 0% || step >= 2px
                    parsedXY[`${axis}Step`] = step;
                  }

                } else {
                  if ((snapValue = validSnapValue(newOptionsXY))) { // pixels | '<n>%'
                    parsedXY[axis] = snapValue;
                  } else { // Default
                    parsedXY[`${axis}Start`] = {value: 0, isRatio: false};
                    parsedXY[`${axis}End`] = {value: 1, isRatio: true};
                  }
                }
                return parsedXY;
              }, {});

              if (parsedXY.xStart && !parsedXY.xStep && parsedXY.yStart && !parsedXY.yStep) {
                // This can be split to 4 lines.
                parsedSnapTargetSplit.push(
                  {xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yStart},
                  {xStart: parsedXY.xStart, xEnd: parsedXY.xEnd, y: parsedXY.yEnd},
                  {x: parsedXY.xStart, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd},
                  {x: parsedXY.xEnd, yStart: parsedXY.yStart, yEnd: parsedXY.yEnd}
                );
              } else {
                parsedSnapTargetSplit.push(parsedXY);
              }

              snapTargetOptions = ['x', 'y'].reduce((snapTargetOptions, axis) => {
                snapTargetOptions[axis] = parsedXY[`${axis}Start`] ?
                  (parsedXY[`${axis}Step`] ? `step:${snapValue2value(parsedXY[`${axis}Step`])}` : '') +
                    `[${snapValue2value(parsedXY[`${axis}Start`])},${snapValue2value(parsedXY[`${axis}End`])}]` :
                  snapValue2value(parsedXY[axis]);
                return snapTargetOptions;
              }, {});
            }
          }

          if (parsedSnapTargetSplit.length) {
            Array.prototype.push.apply(parsedSnapTargets, parsedSnapTargetSplit);
            snapTargetsOptions.push(commonSnapOptions(snapTargetOptions, newSnapTargetOptions));
          }
          return parsedSnapTargets;
        }, []);

    if (parsedSnapTargets.length) {

      const snapOptions = options.snap = commonSnapOptions({targets: snapTargetsOptions}, newSnapOptions); // Update always
      // Set default options in top level.
      if (!snapOptions.gravity) { snapOptions.gravity = SNAP_GRAVITY; }
      if (!snapOptions.edge) { snapOptions.edge = SNAP_EDGE; }
      if (!snapOptions.base) { snapOptions.base = SNAP_BASE; }
      if (!snapOptions.side) { snapOptions.side = SNAP_SIDE; }

      // parsedSnapTargets - commonSnapOptions
      ['x', 'y'].forEach(axis => {
        if (parsedSnapTargets[axis] == null) { return; }
        const axisOptions = snapOptions[axis];
        parsedSnapTargets[axis].forEach((parsedSnapTarget, i) => {
          const snapTargetOptions = snapTargetsOptions[i];
          // gravity
          parsedSnapTarget.gravity = snapTargetOptions.gravity || axisOptions.gravity || snapOptions.gravity;
          // edge
          parsedSnapTarget.edge = snapTargetOptions.edge || axisOptions.edge || snapOptions.edge;
          // base
          if (parsedSnapTarget.isRatio || parsedSnapTarget.repeat) {
            parsedSnapTarget.base = snapTargetOptions.base || axisOptions.base || snapOptions.base;
          }
          // side
          if (parsedSnapTarget.isElement) {
            parsedSnapTarget.side = snapTargetOptions.side || axisOptions.side || snapOptions.side;
          }
        });
      });
      if (hasChanged(parsedSnapTargets, props.parsedSnapTargets)) {
        props.parsedSnapTargets = parsedSnapTargets;
        needsInitBBox = true;
      }
    }
  } else if (newOptions.hasOwnProperty('snap') && props.parsedSnapTargets) {
    options.snap = props.parsedSnapTargets = props.snap = void 0;
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
      }, activeItem.onDrag)) {
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
