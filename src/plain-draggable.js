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
  SNAP_TOLERANCE = 20, SNAP_EDGE = 'both', SNAP_ORIGIN = 'containment', SNAP_SIDE = 'both',

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
        hasChanged((keysA = Object.keys(a)), Object.keys(b)) ||
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
    if (isObject(newOptions.containment) && (bBox = validBBox(copyTree(newOptions.containment))) &&
        hasChanged(bBox, options.containment)) { // bBox
      options.containment = bBox;
      props.containmentIsBBox = true;
      needsInitBBox = true;
    } else if (isElement(newOptions.containment) &&
        newOptions.containment !== options.containment) { // Specific element
      options.containment = newOptions.containment;
      props.containmentIsBBox = false;
      needsInitBBox = true;
    }
  }

  /**
   * @typedef {Object} SnapOptions
   * @property {SnapAxisOptions} [x]
   * @property {SnapAxisOptions} [y]
   * @property {number} [tolerance]
   * @property {string} [edge]
   * @property {string} [origin]
   * @property {string} [side]
   */

  /**
   * @typedef {Object} SnapAxisOptions
   * @property {SnapPointOptions[]} points
   * @property {number} [tolerance]
   * @property {string} [edge]
   * @property {string} [origin]
   * @property {string} [side]
   */

  /**
   * @typedef {Object} SnapPointOptions
   * @property {(number|string|Element)} value - pixels | 'n%' | 's<step><closed-interval>' | Element
   * @property {number} [tolerance]
   * @property {string} [edge]
   * @property {string} [origin]
   * @property {string} [side]
   */

  /**
   * @typedef {Object} ParsedSnapPointOptions
   * @property {(number|Element)} [value] - pixels | ratio (isRatio: true) | Element (isElement: true)
   * @property {number} tolerance
   * @property {string} edge
   * @property {boolean} [isRatio]
   * @property {string} [origin] - isRatio: true or repeat: true
   * @property {boolean} [isElement]
   * @property {string} [side] - isElement: true
   * @property {boolean} [repeat]
   * @property {{value, isRatio}} [step] - repeat: true
   * @property {{value, isRatio}} [start] - repeat: true
   * @property {{value, isRatio}} [end] - repeat: true
   */

  // Initialize `tolerance`, `edge`, `side`, `origin`
  function commonSnapOptions(options, newOptions) {
    // tolerance
    if (isFinite(newOptions.tolerance) &&
      newOptions.tolerance > 0) { options.tolerance = newOptions.tolerance; }
    // edge
    const edge = typeof newOptions.edge === 'string' ? newOptions.edge.toLowerCase() : '';
    if (edge === 'start' || edge === 'end' || edge === 'both') { options.edge = edge; }
    // origin
    const origin = typeof newOptions.origin === 'string' ? newOptions.origin.toLowerCase() : '';
    if (origin === 'containment' || origin === 'document') { options.origin = origin; }
    // side
    const side = typeof newOptions.side === 'string' ? newOptions.side.toLowerCase() : '';
    if (side === 'inner' || side === 'outer' || side === 'both') { options.side = side; }
    return options;
  }

  function parseLen(text) {
    const matches = /^(.+)(\%)?$/.test(text);
    let len, isRatio;
    return matches && isFinite((len = parseFloat(matches[1]))) ?
      {value: (isRatio = !!(matches[2] && len)) ? len / 100 : len, isRatio: isRatio} : null;
  }

  // snap
  if (newOptions.snap != null) {
    const parsedSnapOptions = {}, snapOptions = {},
      newSnapOptions =
        isObject(newOptions.snap) && (newOptions.snap.x != null || newOptions.snap.y != null) ?
          newOptions.snap : {x: newOptions.snap, y: newOptions.snap};

    ['x', 'y'].forEach(axis => {
      if (newSnapOptions[axis] == null) { return; }
      const newAxisOptions =
          isObject(newSnapOptions[axis]) && newSnapOptions[axis].points != null ?
            newSnapOptions[axis] : {points: newSnapOptions[axis]},

        parsedPoints = [],
        points =
          (Array.isArray(newAxisOptions.points) ? newAxisOptions.points : [newAxisOptions.points])
          .reduce((points, point) => {
            if (point == null) { return points; }
            const newPointOptions = isObject(point) && point.value != null ? point : {value: point};
            let value = newPointOptions.value, parsedPointOptions = {}, validValue;

            // Validate `SnapPointOptions.value`
            if (isFinite(value)) { // pixels
              parsedPointOptions.value = validValue = value;

            } else if (typeof value === 'string') {
              value = value.replace(/\s/g, '');
              let parsedLen, matches;

              if ((parsedLen = parseLen(value))) { // 'n%'
                parsedPointOptions = parsedLen;
                validValue = parsedLen.isRatio ? `${parsedLen.value * 100}%` : parsedLen.value; // 0% -> 0px

              } else if ((matches = /^s(.+?)(?:\[(.+)\])?$/.test(value)) && // 's<step><closed-interval>'
                  (parsedLen = parseLen(matches[1])) &&
                  (parsedLen.isRatio ? parsedLen.value > 0 : parsedLen.value >= 2)) { // step > 0% || step >= 2px
                parsedPointOptions.repeat = true;
                parsedPointOptions.step = parsedLen;

                if (matches[2]) {
                  const rangeValues = matches[2].split(',');
                  ['start', 'end'].forEach((prop, i) => {
                    if (rangeValues[i] && (parsedLen = parseLen(rangeValues[i]))) {
                      parsedPointOptions[prop] = parsedLen;
                    }
                  });
                }
                if (!parsedPointOptions.start) { parsedPointOptions.start = {value: 0, isRatio: false}; }
                if (!parsedPointOptions.end) { parsedPointOptions.end = {value: 1, isRatio: true}; }
                if (parsedPointOptions.start.isRatio === parsedPointOptions.end.isRatio &&
                    parsedPointOptions.start.value >= parsedPointOptions.end.value) { // start >= end
                  parsedPointOptions.start = {value: 0, isRatio: false};
                  parsedPointOptions.end = {value: 1, isRatio: true};
                }

                validValue = `s${parsedPointOptions.step.isRatio ?
                    `${parsedPointOptions.step.value * 100}%` : parsedPointOptions.step.value}` +
                  `[${parsedPointOptions.start.isRatio ?
                    `${parsedPointOptions.start.value * 100}%` : parsedPointOptions.start.value}` +
                  `,${parsedPointOptions.end.isRatio ?
                    `${parsedPointOptions.end.value * 100}%` : parsedPointOptions.end.value}]`;
              }

            } else if (isElement(value)) { // Element
              parsedPointOptions.isElement = true;
              parsedPointOptions.value = validValue = value;
            }

            if (validValue != null) {
              parsedPoints.push(parsedPointOptions);
              points.push(commonSnapOptions({value: validValue}, newPointOptions));
            }
            return points;
          }, []);

      if (points.length) {
        parsedSnapOptions[axis] = {points: parsedPoints};
        snapOptions[axis] = commonSnapOptions({points: points}, newAxisOptions);
      }
    });

    if (snapOptions.x || snapOptions.y) {
      options.snap = commonSnapOptions(snapOptions, newSnapOptions); // Update always

      // parsedSnapOptions - commonSnapOptions
      ['x', 'y'].forEach(axis => {
        if (parsedSnapOptions[axis] == null) { return; }
        const axisOptions = snapOptions[axis];
        parsedSnapOptions[axis].points.forEach((point, i) => {
          const pointOptions = axisOptions.points[i];
          // tolerance
          point.tolerance = pointOptions.tolerance || axisOptions.tolerance ||
            snapOptions.tolerance || SNAP_TOLERANCE;
          // edge
          point.edge = pointOptions.edge || axisOptions.edge || snapOptions.edge || SNAP_EDGE;
          // origin
          if (point.isRatio || point.repeat) {
            point.origin = pointOptions.origin || axisOptions.origin || snapOptions.origin || SNAP_ORIGIN;
          }
          // side
          if (point.isElement) {
            point.side = pointOptions.side || axisOptions.side || snapOptions.side || SNAP_SIDE;
          }
        });
      });
      if (hasChanged(parsedSnapOptions, props.parsedSnapOptions)) {
        props.parsedSnapOptions = parsedSnapOptions;
        needsInitBBox = true;
      }
    }
  } else if (newOptions.hasOwnProperty('snap')) {
    options.snap = props.parsedSnapOptions = props.snap = void 0;
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
