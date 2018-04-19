/* exported snapView */
/* eslint-env browser */
/* eslint no-var: "off", prefer-arrow-callback: "off" */

var snapView = (function() {
  'use strict';

  var items = [],
    isFinite = Number.isFinite ||
      function(value) { return typeof value === 'number' && window.isFinite(value); },
    offset;

  function initOffset(element) {
    element.style.left = element.style.top = '0';
    var newBBox = window.getBBox(element);
    offset = {left: newBBox.left ? -newBBox.left : 0, top: newBBox.top ? -newBBox.top : 0}; // avoid `-0`
  }

  function newItem(snapTarget, minLeft, maxLeft, minTop, maxTop) {
    var item = document.body.appendChild(document.createElement('div')),
      start = item.appendChild(document.createElement('div')),
      itemStyle = item.style,
      startStyle = start.style;

    if (snapTarget.x != null && snapTarget.y != null) { // Point
      item.className = 'snap-view-point';
      if (!offset) { initOffset(item); }
      itemStyle.left = snapTarget.x + offset.left + 'px';
      itemStyle.top = snapTarget.y + offset.top + 'px';
      // End side
      itemStyle.width =
        (snapTarget.gravityXEnd != null ? snapTarget.gravityXEnd : maxLeft) - snapTarget.x + 'px';
      itemStyle.height =
        (snapTarget.gravityYEnd != null ? snapTarget.gravityYEnd : maxTop) - snapTarget.y + 'px';
      // Start side
      startStyle.width =
        snapTarget.x - (snapTarget.gravityXStart != null ? snapTarget.gravityXStart : minLeft) + 'px';
      startStyle.height =
        snapTarget.y - (snapTarget.gravityYStart != null ? snapTarget.gravityYStart : minTop) + 'px';

    } else if (snapTarget.y != null) { // Line horizontal
      item.className = 'snap-view-line';
      if (!offset) { initOffset(item); }
      itemStyle.top = snapTarget.y + offset.top + 'px';
      var left = snapTarget.gravityXStart != null ? snapTarget.gravityXStart : minLeft;
      itemStyle.left = left + offset.left + 'px';
      itemStyle.width =
        (snapTarget.gravityXEnd != null ? snapTarget.gravityXEnd : maxLeft) - left + 'px';
      // End side
      itemStyle.height =
        (snapTarget.gravityYEnd != null ? snapTarget.gravityYEnd : maxTop) - snapTarget.y + 'px';
      // Start side
      startStyle.height =
        snapTarget.y - (snapTarget.gravityYStart != null ? snapTarget.gravityYStart : minTop) + 'px';

    } else { // Line vertical
      item.className = 'snap-view-line snap-view-v';
      if (!offset) { initOffset(item); }
      itemStyle.left = snapTarget.x + offset.left + 'px';
      var top = snapTarget.gravityYStart != null ? snapTarget.gravityYStart : minTop;
      itemStyle.top = top + offset.top + 'px';
      itemStyle.height =
        (snapTarget.gravityYEnd != null ? snapTarget.gravityYEnd : maxTop) - top + 'px';
      // End side
      itemStyle.width =
        (snapTarget.gravityXEnd != null ? snapTarget.gravityXEnd : maxLeft) - snapTarget.x + 'px';
      // Start side
      startStyle.width =
        snapTarget.x - (snapTarget.gravityXStart != null ? snapTarget.gravityXStart : minLeft) + 'px';
    }

    return item;
  }

  function snapView() {
    items.forEach(function(item) { item.parentNode.removeChild(item); });
    items = [];
    Object.keys(window.insProps).forEach(function(id) {
      var props = window.insProps[id];
      if (props.snapTargets) {
        props.snapTargets.forEach(function(snapTarget) {
          items.push(newItem(snapTarget, props.minLeft, props.maxLeft, props.minTop, props.maxTop));
        });
        if (!isFinite(parseFloat(getComputedStyle(props.element, '').zIndex))) {
          props.orgZIndex = props.elementStyle.zIndex = 2;
        }
      }
    });
  }

  return snapView;
})();
