describe('snapTargets', function() {
  'use strict';

  var window, document, pageDone,
    parent, elm1, draggable, props,
    elmRect, elmWidth, elmHeight,

    iframe, iWindow, iDocument, iBody,
    iElm1, iDraggable, iProps, iElmWidth, iElmHeight,

    SNAP_GRAVITY, SNAP_CORNER, SNAP_SIDE, SNAP_EDGE, SNAP_BASE;

  function merge() {
    var obj = {};
    Array.prototype.forEach.call(arguments, function(addObj) {
      Object.keys(addObj).forEach(function(key) {
        if (addObj[key] != null) {
          obj[key] = addObj[key];
        } else {
          delete obj[key];
        }
      });
    });
    return obj;
  }

  function getPointTarget(x, y, gravityX, gravityY) {
    var xy = {x: x, y: y},
      gravity = {x: gravityX, y: gravityY};
    return ['x', 'y'].reduce(function(target, axis) {
      if (xy[axis] != null) {
        target[axis] = xy[axis];
        if (gravity[axis] != null) {
          var axisL = axis.toUpperCase();
          target['gravity' + axisL + 'Start'] = target[axis] - gravity[axis];
          target['gravity' + axisL + 'End'] = target[axis] + gravity[axis];
        }
      }
      return target;
    }, {});
  }

  // x/y : number or [start, end]
  function getLineTarget(x, y, gravity, elmSize) {
    var xy = {x: x, y: y},
      elmSizeAxis = {x: elmSize.width, y: elmSize.height};
    return ['x', 'y'].reduce(function(target, axis) {
      var axisL = axis.toUpperCase();
      if (typeof xy[axis] === 'number') {
        target[axis] = xy[axis];
        if (gravity != null) {
          target['gravity' + axisL + 'Start'] = target[axis] - gravity;
          target['gravity' + axisL + 'End'] = target[axis] + gravity;
        }
      } else if (Array.isArray(xy[axis]) && gravity != null) { // Check for gravity ON/OFF
        if (xy[axis][0] != null) { target['gravity' + axisL + 'Start'] = xy[axis][0]; }
        if (xy[axis][1] != null) { target['gravity' + axisL + 'End'] = xy[axis][1] - elmSizeAxis[axis]; }
      }
      return target;
    }, {});
  }

  function getBBoxTargets(left, top, width, height, gravity, elmWidth, elmHeight) {
    var right = left + width,
      bottom = top + height,
      elmRect = {width: elmWidth, height: elmHeight};
    return {
      inside: [
        getLineTarget([left - gravity, right + gravity], top, gravity, elmRect), // Top
        getLineTarget(left, [top - gravity, bottom + gravity], gravity, elmRect), // Left
        getLineTarget([left - gravity, right + gravity], bottom - elmHeight, gravity, elmRect), // Bottom
        getLineTarget(right - elmWidth, [top - gravity, bottom + gravity], gravity, elmRect) // Right
      ],
      outside: [
        getLineTarget([left - elmWidth - gravity, right + elmWidth + gravity],
          top - elmHeight, gravity, elmRect), // Top
        getLineTarget(left - elmWidth,
          [top - elmHeight - gravity, bottom + elmHeight + gravity], gravity, elmRect), // Left
        getLineTarget([left - elmWidth - gravity, right + elmWidth + gravity],
          bottom, gravity, elmRect), // Bottom
        getLineTarget(right,
          [top - elmHeight - gravity, bottom + elmHeight + gravity], gravity, elmRect) // Right
      ]
    };
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common-window.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      pageDone = done;

      parent = document.getElementById('parent');
      parent.style.height = '600px';
      elm1 = document.getElementById('elm1');
      draggable = new window.PlainDraggable(elm1);
      props = window.insProps[draggable._id];

      elmRect = elm1.getBoundingClientRect();
      elmWidth = elmRect.width;
      elmHeight = elmRect.height;

      iframe = document.getElementById('iframe');
      iWindow = iframe.contentWindow;
      iDocument = iWindow.document;
      iBody = iDocument.body;
      iElm1 = iDocument.getElementById('elm1');
      iDocument.getElementById('parent').style.height = '600px';
      iDraggable = new iWindow.PlainDraggable(iElm1);
      iProps = iWindow.insProps[iDraggable._id];
      iBody.style.margin = iBody.style.borderWidth = iBody.style.padding = '0';
      iBody.style.overflow = 'hidden'; // Hide vertical scroll bar that change width of document.

      elmRect = iElm1.getBoundingClientRect();
      iElmWidth = elmRect.width;
      iElmHeight = elmRect.height;

      SNAP_GRAVITY = window.SNAP_GRAVITY;
      SNAP_CORNER = window.SNAP_CORNER;
      SNAP_SIDE = window.SNAP_SIDE;
      SNAP_EDGE = window.SNAP_EDGE;
      SNAP_BASE = window.SNAP_BASE;

      beforeDone();
    }, 'snapTargets');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainDraggable.limit).toBe(!!self.top.LIMIT);
  });

  it('Point', function(done) {
    var parentBBox = window.getBBox(parent),
      share;

    // Parse pixels
    draggable.snap = 300;
    expect(props.snapTargets).toEqual([
      getPointTarget(
        parentBBox.left + 300,
        parentBBox.top + 300,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // Parse n%
    draggable.snap = ['50%', {x: 400, y: 300}]; // base 800 x 600
    share = getPointTarget(
      parentBBox.left + 400,
      parentBBox.top + 300,
      SNAP_GRAVITY, SNAP_GRAVITY);
    expect(props.snapTargets).toEqual([share, share]);

    // Specify gravity
    var gravity = 48;
    draggable.snap = ['50%', {x: 400, y: 300, gravity: gravity}]; // base 800 x 600
    share = {
      x: parentBBox.left + 400,
      y: parentBBox.top + 300
    };
    expect(props.snapTargets).toEqual([
      getPointTarget(share.x, share.y, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(share.x, share.y, gravity, gravity)
    ]);

    // corner br
    draggable.snap = {x: 400, y: 300, corner: 'br'};
    expect(props.snapTargets).toEqual([
      getPointTarget(
        parentBBox.left + 400 - elmWidth,
        parentBBox.top + 300 - elmHeight,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // corner tr
    draggable.snap = {x: 400, y: 300, corner: 'tr'};
    expect(props.snapTargets).toEqual([
      getPointTarget(
        parentBBox.left + 400 - elmWidth,
        parentBBox.top + 300,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // corner tr, bl
    draggable.snap = {x: 400, y: 300, corner: 'tr, bl'};
    expect(props.snapTargets).toEqual([
      getPointTarget(
        parentBBox.left + 400 - elmWidth,
        parentBBox.top + 300,
        SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(
        parentBBox.left + 400,
        parentBBox.top + 300 - elmHeight,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // corner all
    draggable.snap = {x: 400, y: 300, corner: 'all'}; // -> tl, tr, bl, br
    expect(props.snapTargets).toEqual([
      getPointTarget( // tl
        parentBBox.left + 400,
        parentBBox.top + 300,
        SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget( // tr
        parentBBox.left + 400 - elmWidth,
        parentBBox.top + 300,
        SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget( // bl
        parentBBox.left + 400,
        parentBBox.top + 300 - elmHeight,
        SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget( // br
        parentBBox.left + 400 - elmWidth,
        parentBBox.top + 300 - elmHeight,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // center
    draggable.snap = {x: 400, y: 300, corner: 'all', center: true}; // corner: all -> tr
    expect(props.snapTargets).toEqual([
      getPointTarget(
        parentBBox.left + 400 - elmWidth / 2,
        parentBBox.top + 300 - elmHeight / 2,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // Outside containment (containment: 800 x 600)
    var minLeft = SNAP_GRAVITY,
      minTop = SNAP_GRAVITY;
    draggable.snap = {x: minLeft + 1, y: minTop + 1};
    expect(props.snapTargets).toEqual([
      getPointTarget(
        parentBBox.left + minLeft + 1,
        parentBBox.top + minTop + 1,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // Target is removed
    draggable.snap = {x: minLeft + 1, y: minTop - SNAP_GRAVITY - 1};
    expect(props.snapTargets == null).toBe(true);
    expect(draggable.snap == null).toBe(false);

    // Point on edge: Target is not removed (gravity*Start is removed)
    draggable.snap = {x: minLeft + 1, y: minTop - SNAP_GRAVITY};
    share = getPointTarget(
      parentBBox.left + minLeft + 1,
      parentBBox.top + minTop - SNAP_GRAVITY,
      SNAP_GRAVITY, SNAP_GRAVITY);
    delete share.gravityYStart;
    expect(props.snapTargets).toEqual([share]);

    // gravity*Start is removed
    draggable.snap = {x: minLeft + 1, y: minTop - 1};
    share = getPointTarget(
      parentBBox.left + minLeft + 1,
      parentBBox.top + minTop - 1,
      SNAP_GRAVITY, SNAP_GRAVITY);
    delete share.gravityYStart;
    expect(props.snapTargets).toEqual([share]);

    // gravity*Start on edge: gravity*Start is removed
    draggable.snap = {x: minLeft + 1, y: minTop};
    share = getPointTarget(
      parentBBox.left + minLeft + 1,
      parentBBox.top + minTop,
      SNAP_GRAVITY, SNAP_GRAVITY);
    delete share.gravityYStart;
    expect(props.snapTargets).toEqual([share]);

    // bl is removed
    draggable.snap = {x: 750, y: 300, corner: 'tr, bl'};
    expect(props.snapTargets).toEqual([
      getPointTarget(
        parentBBox.left + 750 - elmWidth,
        parentBBox.top + 300,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // tl, tr, bl are removed
    draggable.snap = {x: 750, y: 550, corner: 'all'}; // -> tl, tr, bl, br
    expect(props.snapTargets).toEqual([
      getPointTarget( // br
        parentBBox.left + 750 - elmWidth,
        parentBBox.top + 550 - elmHeight,
        SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    done();
  });

  it('Line', function(done) {
    var parentBBox = window.getBBox(parent),
      share;

    // Parse pixels, range
    draggable.snap = {x: {start: 100, end: 600}, y: 300};
    expect(props.snapTargets).toEqual([
      getLineTarget(
        [
          parentBBox.left + 100,
          parentBBox.left + 600
        ],
        parentBBox.top + 300,
        SNAP_GRAVITY, elmRect),
      getLineTarget(
        [
          parentBBox.left + 100,
          parentBBox.left + 600
        ],
        parentBBox.top + 300 - elmHeight,
        SNAP_GRAVITY, elmRect)
    ]);

    // Parse pixels, no range
    draggable.snap = {y: 300}; // x: [0, 100%] -> removed
    expect(props.snapTargets).toEqual([
      getLineTarget(
        null,
        parentBBox.top + 300,
        SNAP_GRAVITY, elmRect),
      getLineTarget(
        null,
        parentBBox.top + 300 - elmHeight,
        SNAP_GRAVITY, elmRect)
    ]);

    // Parse n%
    draggable.snap = {side: 'start', targets: [
      {x: '50%', y: {start: '50%', end: '70%'}}, // base 800 x 600
      {x: 400, y: {start: 300, end: 420}}
    ]};
    share = getLineTarget(
      parentBBox.left + 400,
      [parentBBox.top + 300, parentBBox.top + 420],
      SNAP_GRAVITY, elmRect);
    expect(props.snapTargets).toEqual([share, share]);

    // start >= end -> removed (setOptions removes it if start.isRatio === end.isRatio)
    draggable.snap = {x: {start: 400, end: '50%'}, y: 300}; // start === end
    expect(props.snapTargets == null).toBe(true);
    expect(draggable.snap == null).toBe(false); // setOptions didn't remove it.
    draggable.snap = {x: {start: 401, end: '50%'}, y: 300}; // start > end
    expect(props.snapTargets == null).toBe(true);
    expect(draggable.snap == null).toBe(false); // setOptions didn't remove it.

    // Specify gravity
    var gravity = 48;
    draggable.snap = {side: 'start', targets: [
      {x: '50%', y: {start: '50%', end: '70%'}}, // base 800 x 600
      {x: 400, y: {start: 300, end: 420}, gravity: gravity}
    ]};
    share = {
      x: parentBBox.left + 400,
      y: [parentBBox.top + 300, parentBBox.top + 420]
    };
    expect(props.snapTargets).toEqual([
      getLineTarget(share.x, share.y, SNAP_GRAVITY, elmRect),
      getLineTarget(share.x, share.y, gravity, elmRect)
    ]);

    // side start
    draggable.snap = {x: 400, y: {start: 300, end: 420}, side: 'start'};
    expect(props.snapTargets).toEqual([
      getLineTarget(
        parentBBox.left + 400,
        [parentBBox.top + 300, parentBBox.top + 420],
        SNAP_GRAVITY, elmRect)
    ]);

    // side end
    draggable.snap = {x: 400, y: {start: 300, end: 420}, side: 'end'};
    expect(props.snapTargets).toEqual([
      getLineTarget(
        parentBBox.left + 400 - elmWidth,
        [parentBBox.top + 300, parentBBox.top + 420],
        SNAP_GRAVITY, elmRect)
    ]);

    // side both
    draggable.snap = {x: 400, y: {start: 300, end: 420}, side: 'both'}; // -> start, end
    expect(props.snapTargets).toEqual([
      getLineTarget( // start
        parentBBox.left + 400,
        [parentBBox.top + 300, parentBBox.top + 420],
        SNAP_GRAVITY, elmRect),
      getLineTarget( // end
        parentBBox.left + 400 - elmWidth,
        [parentBBox.top + 300, parentBBox.top + 420],
        SNAP_GRAVITY, elmRect)
    ]);

    // center
    draggable.snap = {x: 400, y: {start: 300, end: 420}, side: 'both', center: true}; // side: both -> start
    expect(props.snapTargets).toEqual([
      getLineTarget(
        parentBBox.left + 400 - elmWidth / 2,
        [parentBBox.top + 300, parentBBox.top + 420],
        SNAP_GRAVITY, elmRect)
    ]);

    // Outside containment (containment: 800 x 600)
    var minLeft = SNAP_GRAVITY;
    draggable.snap = {x: minLeft + 1, side: 'start'};
    expect(props.snapTargets).toEqual([
      getLineTarget(
        parentBBox.left + minLeft + 1,
        null,
        SNAP_GRAVITY, elmRect)
    ]);

    // Target is removed
    draggable.snap = {x: minLeft - SNAP_GRAVITY - 1, side: 'start'};
    expect(props.snapTargets == null).toBe(true);
    expect(draggable.snap == null).toBe(false);

    // Line on edge: Target is not removed (gravity*Start is removed)
    draggable.snap = {x: minLeft - SNAP_GRAVITY, side: 'start'};
    share = getLineTarget(
      parentBBox.left + minLeft - SNAP_GRAVITY,
      null,
      SNAP_GRAVITY, elmRect);
    delete share.gravityXStart;
    expect(props.snapTargets).toEqual([share]);

    // gravity*Start is removed
    draggable.snap = {x: minLeft - 1, side: 'start'};
    share = getLineTarget(
      parentBBox.left + minLeft - 1,
      null,
      SNAP_GRAVITY, elmRect);
    delete share.gravityXStart;
    expect(props.snapTargets).toEqual([share]);

    // gravity*Start on edge: gravity*Start is removed
    draggable.snap = {x: minLeft, side: 'start'};
    share = getLineTarget(
      parentBBox.left + minLeft,
      null,
      SNAP_GRAVITY, elmRect);
    delete share.gravityXStart;
    expect(props.snapTargets).toEqual([share]);

    // start is removed
    draggable.snap = {x: 750, side: 'both'};
    expect(props.snapTargets).toEqual([
      getLineTarget(
        parentBBox.left + 750 - elmWidth,
        null,
        SNAP_GRAVITY, elmRect)
    ]);

    // Outside containment, range -> remove
    draggable.snap = {x: {start: minLeft - 400, end: minLeft - 100}, y: 300};
    expect(props.snapTargets == null).toBe(true);
    expect(draggable.snap == null).toBe(false); // setOptions didn't remove it.

    done();
  });

  it('Step', function(done) {
    var parentBBox = window.getBBox(parent),
      share;

    // Parse pixels
    draggable.snap = {y: {step: 200}}; // x: [0, 100%] -> removed
    expect(props.snapTargets).toEqual([
      merge(getLineTarget(null, parentBBox.top, SNAP_GRAVITY, elmRect), {gravityYStart: null}),
      // 0 - elmHeight: removed
      getLineTarget(null, parentBBox.top + 200, SNAP_GRAVITY, elmRect),
      getLineTarget(null, parentBBox.top + 200 - elmHeight, SNAP_GRAVITY, elmRect),
      getLineTarget(null, parentBBox.top + 400, SNAP_GRAVITY, elmRect),
      getLineTarget(null, parentBBox.top + 400 - elmHeight, SNAP_GRAVITY, elmRect),
      // 600: removed
      merge(getLineTarget(null, parentBBox.top + 600 - elmHeight, SNAP_GRAVITY, elmRect), {gravityYEnd: null})
    ]);

    // Parse pixels, range
    draggable.snap = {y: {step: 150, start: 50, end: 450}};
    expect(props.snapTargets).toEqual([
      getLineTarget(null, parentBBox.top + 50, SNAP_GRAVITY, elmRect),
      // 50 - elmHeight: removed
      getLineTarget(null, parentBBox.top + 200, SNAP_GRAVITY, elmRect),
      getLineTarget(null, parentBBox.top + 200 - elmHeight, SNAP_GRAVITY, elmRect),
      getLineTarget(null, parentBBox.top + 350, SNAP_GRAVITY, elmRect),
      getLineTarget(null, parentBBox.top + 350 - elmHeight, SNAP_GRAVITY, elmRect)
    ]);

    // Vertical
    draggable.snap = {x: {step: 150, start: 150, end: 550}};
    expect(props.snapTargets).toEqual([
      getLineTarget(parentBBox.top + 150, null, SNAP_GRAVITY, elmRect),
      getLineTarget(parentBBox.top + 150 - elmWidth, null, SNAP_GRAVITY, elmRect),
      getLineTarget(parentBBox.top + 300, null, SNAP_GRAVITY, elmRect),
      getLineTarget(parentBBox.top + 300 - elmWidth, null, SNAP_GRAVITY, elmRect),
      getLineTarget(parentBBox.top + 450, null, SNAP_GRAVITY, elmRect),
      getLineTarget(parentBBox.top + 450 - elmWidth, null, SNAP_GRAVITY, elmRect)
    ]);

    // Reduce gravity
    draggable.snap = {y: {step: 30, start: 300, end: 380}, side: 'start'};
    expect(props.snapTargets).toEqual([
      getLineTarget(null, parentBBox.top + 300, 15, elmRect),
      getLineTarget(null, parentBBox.top + 330, 15, elmRect),
      getLineTarget(null, parentBBox.top + 360, 15, elmRect)
    ]);

    // Parse pixels, with Line range
    draggable.snap = {x: {start: 10, end: 300}, y: {step: 150, start: 50, end: 450}, side: 'start'};
    share = [parentBBox.left + 10, parentBBox.left + 300];
    expect(props.snapTargets).toEqual([
      getLineTarget(share, parentBBox.top + 50, SNAP_GRAVITY, elmRect),
      getLineTarget(share, parentBBox.top + 200, SNAP_GRAVITY, elmRect),
      getLineTarget(share, parentBBox.top + 350, SNAP_GRAVITY, elmRect)
    ]);

    // Parse pixels, with Line range -> gravityXEnd is removed
    draggable.snap = {x: {start: 10, end: 800}, y: {step: 150, start: 50, end: 450}, side: 'start'};
    share = [parentBBox.left + 10, parentBBox.left + 800];
    expect(props.snapTargets).toEqual([
      merge(getLineTarget(share, parentBBox.top + 50, SNAP_GRAVITY, elmRect), {gravityXEnd: null}),
      merge(getLineTarget(share, parentBBox.top + 200, SNAP_GRAVITY, elmRect), {gravityXEnd: null}),
      merge(getLineTarget(share, parentBBox.top + 350, SNAP_GRAVITY, elmRect), {gravityXEnd: null})
    ]);

    // Step < 2px -> remove
    // Step === 2px
    draggable.snap = {x: {step: '0.25%', start: 300, end: 305}, side: 'start'}; // width: 800 -> 2px
    expect(props.snapTargets).toEqual([
      getLineTarget(parentBBox.left + 300, null, 1, elmRect),
      getLineTarget(parentBBox.left + 302, null, 1, elmRect),
      getLineTarget(parentBBox.left + 304, null, 1, elmRect)
    ]);
    // Step < 2px -> remove
    draggable.snap = {x: {step: '0.24%', start: 300, end: 305}, side: 'start'}; // width: 800 -> 2px
    expect(props.snapTargets == null).toBe(true);
    expect(draggable.snap == null).toBe(false); // setOptions didn't remove it.

    // xStep, yStep
    draggable.snap = {
      x: {step: 100, start: 50, end: 300},
      y: {step: 150, start: 50, end: 450}
    };
    expect(props.snapTargets).toEqual([
      getPointTarget(parentBBox.left + 50, parentBBox.top + 50, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 50, parentBBox.top + 200, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 50, parentBBox.top + 350, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 150, parentBBox.top + 50, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 150, parentBBox.top + 200, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 150, parentBBox.top + 350, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 250, parentBBox.top + 50, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 250, parentBBox.top + 200, SNAP_GRAVITY, SNAP_GRAVITY),
      getPointTarget(parentBBox.left + 250, parentBBox.top + 350, SNAP_GRAVITY, SNAP_GRAVITY)
    ]);

    // xStep, yStep, reduce gravity
    draggable.snap = {
      x: {step: 100, start: 50, end: 300},
      y: {step: 36, start: 50, end: 130}
    };
    expect(props.snapTargets).toEqual([
      getPointTarget(parentBBox.left + 50, parentBBox.top + 50, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 50, parentBBox.top + 86, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 50, parentBBox.top + 122, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 150, parentBBox.top + 50, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 150, parentBBox.top + 86, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 150, parentBBox.top + 122, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 250, parentBBox.top + 50, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 250, parentBBox.top + 86, SNAP_GRAVITY, 18),
      getPointTarget(parentBBox.left + 250, parentBBox.top + 122, SNAP_GRAVITY, 18)
    ]);

    done();
  });

  it('BBox', function(done) {
    var targets,
      parentBBox = window.getBBox(parent),
      bBox = {
        left: 170,
        top: 160,
        width: 480,
        height: 280
      },
      bBox2 = {width: bBox.width, height: bBox.height,
        left: bBox.left - parentBBox.left, top: bBox.top - parentBBox.top};

    // inside/outside
    draggable.snap = bBox2;
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // inside
    draggable.snap = {boundingBox: bBox2, edge: 'inside'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside);

    // outside
    draggable.snap = {boundingBox: bBox2, edge: 'outside'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.outside);

    // base: document
    draggable.snap = {boundingBox: bBox, base: 'document'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // n%
    expect(parentBBox.width).toBe(800);
    expect(parentBBox.height).toBe(600);
    bBox = {
      left: '20%', // 160px
      top: '25%', // 150px
      width: '60%', // 480px
      height: '45%' // 270px
    };
    draggable.snap = bBox;
    targets = getBBoxTargets(160 + parentBBox.left, 150 + parentBBox.top, 480, 270,
      SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));
    // Change base size
    parent.style.width = '780px';
    parent.style.height = '700px';
    draggable.position();
    targets = getBBoxTargets(
      780 * 0.2 + parentBBox.left,
      700 * 0.25 + parentBBox.top,
      780 * 0.6, 700 * 0.45,
      SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));
    parent.style.width = '';
    parent.style.height = '600px';

    // Invalid
    bBox = { // base 800 x 600
      left: '50%', // 400px
      top: '25%',
      right: 300,
      height: '45%'
    };
    draggable.snap = bBox;
    expect(draggable.snap).toEqual({ // PPBBox is accepted.
      gravity: SNAP_GRAVITY,
      corner: SNAP_CORNER,
      side: SNAP_SIDE,
      center: false,
      edge: SNAP_EDGE,
      base: SNAP_BASE,
      targets: [{boundingBox: {
        left: '50%',
        x: '50%',
        top: '25%',
        y: '25%',
        right: 300,
        height: '45%'
      }}]
    });
    expect(props.snapTargets == null).toBe(true);

    // base: document, n%
    iframe.style.width = '820px';
    iBody.style.height = '680px';
    bBox = {
      left: '22%',
      top: '20%',
      width: '45%',
      height: '30%'
    };
    iDraggable.snap = {boundingBox: bBox, base: 'document'};
    targets = getBBoxTargets(
      820 * 0.22, 680 * 0.2,
      820 * 0.45, 680 * 0.3,
      SNAP_GRAVITY, iElmWidth, iElmHeight);
    expect(iProps.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // Outside containment (containment: 800 x 600)
    var minLeft = parentBBox.left + elmWidth + SNAP_GRAVITY,
      minTop = parentBBox.top + elmHeight + SNAP_GRAVITY;
    bBox = {left: minLeft + 1, top: minTop + 1, width: 500, height: 300};
    draggable.snap = {boundingBox: bBox, base: 'document'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // Target is removed
    bBox = {left: minLeft + 1, top: minTop - SNAP_GRAVITY - 1, width: 500, height: 300};
    draggable.snap = {boundingBox: bBox, base: 'document'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    delete targets.outside[1].gravityYStart; // Reduce left
    delete targets.outside[3].gravityYStart; // Reduce right
    targets.outside = [targets.outside[1], targets.outside[2], targets.outside[3]]; // Remove top
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // Line on edge: Target is not removed (gravity*Start is removed)
    bBox = {left: minLeft + 1, top: minTop - SNAP_GRAVITY, width: 500, height: 300};
    draggable.snap = {boundingBox: bBox, base: 'document'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    delete targets.outside[0].gravityYStart; // gravityYStart of top
    delete targets.outside[1].gravityYStart; // Reduce left
    delete targets.outside[3].gravityYStart; // Reduce right
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // gravity*Start is removed
    bBox = {left: minLeft + 1, top: minTop - 1, width: 500, height: 300};
    draggable.snap = {boundingBox: bBox, base: 'document'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    delete targets.outside[0].gravityYStart; // gravityYStart of top
    delete targets.outside[1].gravityYStart; // Reduce left
    delete targets.outside[3].gravityYStart; // Reduce right
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // gravity*Start on edge: gravity*Start is removed
    bBox = {left: minLeft + 1, top: minTop, width: 500, height: 300};
    draggable.snap = {boundingBox: bBox, base: 'document'};
    targets = getBBoxTargets(bBox.left, bBox.top, bBox.width, bBox.height, SNAP_GRAVITY, elmWidth, elmHeight);
    delete targets.outside[0].gravityYStart; // gravityYStart of top
    delete targets.outside[1].gravityYStart; // Reduce left
    delete targets.outside[3].gravityYStart; // Reduce right
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    done();
  });

  it('Element', function(done) {
    var snapElm = document.body.appendChild(document.createElement('div')),
      left, top, width, height, targets;

    snapElm.style.position = 'absolute';
    snapElm.style.backgroundColor = 'rgba(169, 208, 24, 0.6)';

    snapElm.style.left = (left = 170) + 'px';
    snapElm.style.top = (top = 160) + 'px';
    snapElm.style.width = (width = 480) + 'px';
    snapElm.style.height = (height = 280) + 'px';

    // inside/outside
    draggable.snap = snapElm;
    targets = getBBoxTargets(left, top, width, height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    // inside
    draggable.snap = {boundingBox: snapElm, edge: 'inside'};
    targets = getBBoxTargets(left, top, width, height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside);

    // outside
    draggable.snap = {boundingBox: snapElm, edge: 'outside'};
    targets = getBBoxTargets(left, top, width, height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.outside);

    // Change draggable target size
    var newWidth = 64;
    elm1.style.width = newWidth + 'px';
    draggable.snap = snapElm; // elementBBox also is updated.
    targets = getBBoxTargets(left, top, width, height, SNAP_GRAVITY, newWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));
    elm1.style.width = '';

    // Change gravity
    var newGravity = 14;
    draggable.snap = {boundingBox: snapElm, gravity: newGravity};
    targets = getBBoxTargets(left, top, width, height, newGravity, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));
    draggable.snap = snapElm;

    // Change snap element size
    snapElm.style.left = (left = 220) + 'px';
    snapElm.style.top = (top = 200) + 'px';
    snapElm.style.width = (width = 280) + 'px';
    snapElm.style.height = (height = 220) + 'px';
    draggable.position();
    targets = getBBoxTargets(left, top, width, height, SNAP_GRAVITY, elmWidth, elmHeight);
    expect(props.snapTargets).toEqual(targets.inside.concat(targets.outside));

    done();
  });

});
