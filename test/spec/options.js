describe('setOptions()', function() {
  'use strict';

  var LIMIT = self.top.LIMIT;
  var window, document, body, pageDone,
    parent, elm1, handle, draggable, props,
    SNAP_GRAVITY, SNAP_CORNER, SNAP_SIDE, SNAP_EDGE, SNAP_BASE,
    SNAP_ALL_CORNERS, SNAP_ALL_SIDES, SNAP_ALL_EDGES,
    DEFAULT_SNAP_CORNERS, DEFAULT_SNAP_SIDES, DEFAULT_SNAP_EDGES,
    DEFAULT_PARSED_SNAP_TARGET, DEFAULT_SNAP_OPTIONS,
    AUTOSCROLL_SPEED, AUTOSCROLL_SENSITIVITY,
    DEFAULT_START = {value: 0, isRatio: false},
    DEFAULT_END = {value: 1, isRatio: true},
    ppValue2OptionValue;

  function merge() {
    var obj = {};
    Array.prototype.forEach.call(arguments, function(addObj) {
      Object.keys(addObj).forEach(function(key) { obj[key] = addObj[key]; });
    });
    return obj;
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common-window.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      body = pageBody;
      pageDone = done;

      parent = document.getElementById('parent');
      elm1 = document.getElementById('elm1');
      handle = document.getElementById('handle');
      draggable = new window.PlainDraggable(elm1);
      props = window.insProps[draggable._id];

      if (!LIMIT) {
        SNAP_GRAVITY = window.SNAP_GRAVITY;
        SNAP_CORNER = window.SNAP_CORNER;
        SNAP_SIDE = window.SNAP_SIDE;
        SNAP_EDGE = window.SNAP_EDGE;
        SNAP_BASE = window.SNAP_BASE;
        SNAP_ALL_CORNERS = window.SNAP_ALL_CORNERS;
        SNAP_ALL_SIDES = window.SNAP_ALL_SIDES;
        SNAP_ALL_EDGES = window.SNAP_ALL_EDGES;

        DEFAULT_SNAP_CORNERS =
          SNAP_CORNER === 'all' ? SNAP_ALL_CORNERS : SNAP_CORNER.split(' ');
        DEFAULT_SNAP_SIDES =
          SNAP_SIDE === 'both' ? SNAP_ALL_SIDES : SNAP_SIDE.split(' ');
        DEFAULT_SNAP_EDGES =
          SNAP_EDGE === 'both' ? SNAP_ALL_EDGES : SNAP_EDGE.split(' ');
        DEFAULT_PARSED_SNAP_TARGET = {
          gravity: SNAP_GRAVITY,
          corners: DEFAULT_SNAP_CORNERS,
          sides: DEFAULT_SNAP_SIDES,
          center: false,
          edges: DEFAULT_SNAP_EDGES,
          base: SNAP_BASE
        };
        DEFAULT_SNAP_OPTIONS = {
          gravity: SNAP_GRAVITY,
          corner: SNAP_CORNER,
          side: SNAP_SIDE,
          center: false,
          edge: SNAP_EDGE,
          base: SNAP_BASE
        };

        AUTOSCROLL_SPEED = window.AUTOSCROLL_SPEED;
        AUTOSCROLL_SENSITIVITY = window.AUTOSCROLL_SENSITIVITY;
      }
      ppValue2OptionValue = window.ppValue2OptionValue;

      beforeDone();
    }, 'setOptions()');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!LIMIT + ')', function() {
    expect(!!window.PlainDraggable.limit).toBe(!!LIMIT);
  });

  it('should accept an element as `containment`', function(done) {
    expect(draggable.element).toBe(elm1);
    expect(draggable.containment).toBe(parent);
    expect(props.containmentIsBBox).toBe(false);

    done();
  });

  it('should not update when same element is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = parent;
    expect(window.initBBoxDone).toBe(false);
    expect(props.containmentIsBBox).toBe(false);

    done();
  });

  it('should update when new element is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = body;
    expect(window.initBBoxDone).toBe(true);
    expect(props.containmentIsBBox).toBe(false);

    done();
  });

  it('should accept an BBox as `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {left: 0, top: 0, width: 128, height: 64};
    expect(window.initBBoxDone).toBe(true);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 0, top: 0, width: 128, height: 64, x: 0, y: 0, right: 128, bottom: 64});
    expect(draggable.containment)
      .toEqual({left: 0, top: 0, x: 0, y: 0, width: 128, height: 64}); // x/y are copied, but not right/bottom

    done();
  });

  it('should not update when same BBox is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {x: 0, y: 0, width: 128, height: 64}; // Substitutes props x/y
    expect(window.initBBoxDone).toBe(false);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 0, top: 0, width: 128, height: 64, x: 0, y: 0, right: 128, bottom: 64});
    expect(draggable.containment)
      .toEqual({left: 0, top: 0, x: 0, y: 0, width: 128, height: 64}); // x/y are copied, but not right/bottom

    done();
  });

  it('should update when new BBox is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {left: 1, top: 0, width: 128, height: 64};
    expect(window.initBBoxDone).toBe(true);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 1, top: 0, width: 128, height: 64, x: 1, y: 0, right: 129, bottom: 64});
    expect(draggable.containment)
      .toEqual({left: 1, top: 0, x: 1, y: 0, width: 128, height: 64}); // x/y are copied, but not right/bottom

    done();
  });

  it('should update `handle`', function(done) {
    expect(draggable.handle).toBe(elm1); // Default
    draggable.handle = handle;
    expect(draggable.handle).toBe(handle);

    done();
  });

  it('should update `zIndex`', function(done) {
    draggable.zIndex = 5;
    expect(draggable.zIndex).toBe(5);
    draggable.zIndex = 6;
    expect(draggable.zIndex).toBe(6);
    draggable.zIndex = true;
    expect(draggable.zIndex).toBe(6); // Ignored
    draggable.zIndex = false;
    expect(draggable.zIndex).toBe(false);

    done();
  });

  it('should update event listener', function(done) {
    function fnc() {}
    expect(draggable.onDrag).not.toBeDefined(); // Default
    draggable.onDrag = fnc;
    expect(draggable.onDrag).toBe(fnc);
    draggable.onDrag = true;
    expect(draggable.onDrag).toBe(fnc); // Ignored
    draggable.onDrag = null;
    expect(draggable.onDrag).not.toBeDefined();

    done();
  });

  it('`snap` - value types', function(done) {
    if (LIMIT) { done(); return; }
    var share;

    // pixels
    window.initBBoxDone = false;
    draggable.snap = 16;
    expect(window.initBBoxDone).toBe(true);
    share = {value: 16, isRatio: false};
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      {x: share, y: share}
    )]);
    share = ppValue2OptionValue(share);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: share, y: share}]}
    ));

    // n%
    window.initBBoxDone = false;
    draggable.snap = ' + 25 % ';
    expect(window.initBBoxDone).toBe(true);
    share = {value: 0.25, isRatio: true};
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      {x: share, y: share}
    )]);
    share = ppValue2OptionValue(share);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: share, y: share}]}
    ));

    // {start, end}
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 8, end: 256}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 8, isRatio: false},
      xEnd: {value: 256, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // {start, end} Invalid (start >= end)
    var parsedSnapTargetsSave = props.parsedSnapTargets,
      snapSave = draggable.snap;
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 32, end: 32}, y: 5}; // start === end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 33, end: 32}, y: 5}; // start > end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);

    // {start, end} n%
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '8%', end: 256}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 0.08, isRatio: true},
      xEnd: {value: 256, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // {start, end} n% Invalid (start >= end)
    parsedSnapTargetsSave = props.parsedSnapTargets;
    snapSave = draggable.snap;
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '8%', end: '8%'}, y: 5}; // start === end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '8.1%', end: '8%'}, y: 5}; // start > end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);

    // {step, start, end}
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '8%', end: 256, step: 16}, y: 5}; // `8%` to avoid expanding
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 0.08, isRatio: true},
      xEnd: {value: 256, isRatio: false},
      xStep: {value: 16, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd),
        step: ppValue2OptionValue(share.xStep)}, y: 5}]}
    ));

    // {step, start, end} n%
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '8%', end: 256, step: '16%'}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 0.08, isRatio: true},
      xEnd: {value: 256, isRatio: false},
      xStep: {value: 0.16, isRatio: true}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd),
        step: ppValue2OptionValue(share.xStep)}, y: 5}]}
    ));

    // Element
    window.initBBoxDone = false;
    draggable.snap = parent;
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      {element: parent}
    )]);
    share = ppValue2OptionValue(share);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{boundingBox: parent}]}
    ));

    // PPBBox
    window.initBBoxDone = false;
    draggable.snap = {x: 1, top: '2%', width: 128, bottom: '25%'};
    expect(window.initBBoxDone).toBe(true);
    share = {
      x: {value: 1, isRatio: false},
      y: {value: 0.02, isRatio: true},
      width: {value: 128, isRatio: false},
      bottom: {value: 0.25, isRatio: true}
    };
    share.left = share.x;
    share.top = share.y;
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      {ppBBox: share}
    )]);
    share.left = share.x = ppValue2OptionValue(share.x);
    share.top = share.y = ppValue2OptionValue(share.y);
    share.width = ppValue2OptionValue(share.width);
    share.bottom = ppValue2OptionValue(share.bottom);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{boundingBox: share}]}
    ));

    done();
  });

  it('`snap` - start/end', function(done) {
    if (LIMIT) { done(); return; }
    var share;

    // px
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 2, end: 3}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 2, isRatio: false},
      xEnd: {value: 3, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // percent
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '5%', end: '6%'}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 0.05, isRatio: true},
      xEnd: {value: 0.06, isRatio: true}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // px/percent and same number
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 5, end: '5%'}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 5, isRatio: false},
      xEnd: {value: 0.05, isRatio: true}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // Invalid start >= end px
    var parsedSnapTargetsSave = props.parsedSnapTargets,
      snapSave = draggable.snap;
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 2, end: 2}, y: 5}; // start === end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 3, end: 2}, y: 5}; // start > end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);

    // Invalid start >= end percent
    parsedSnapTargetsSave = props.parsedSnapTargets;
    snapSave = draggable.snap;
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '5%', end: '5%'}, y: 5}; // start === end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '5.1%', end: '5%'}, y: 5}; // start > end
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);

    // `start` px
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 16}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 16, isRatio: false},
      xEnd: DEFAULT_END
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // `start` percent
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '16%'}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 0.16, isRatio: true},
      xEnd: DEFAULT_END
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // `end` px
    window.initBBoxDone = false;
    draggable.snap = {x: {end: 64}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: DEFAULT_START,
      xEnd: {value: 64, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // `end` percent
    window.initBBoxDone = false;
    draggable.snap = {x: {end: '64%'}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: DEFAULT_START,
      xEnd: {value: 0.64, isRatio: true}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)}, y: 5}]}
    ));

    // Expand - 4 lines
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 2, end: 4}, y: {start: 8, end: 16}};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: {value: 2, isRatio: false},
      xEnd: {value: 4, isRatio: false}
    };
    var share2 = { // y
      yStart: {value: 8, isRatio: false},
      yEnd: {value: 16, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, share, {y: share2.yStart}),
      merge(DEFAULT_PARSED_SNAP_TARGET, share, {y: share2.yEnd}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: share.xStart}, share2),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: share.xEnd}, share2)
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd)},
        y: {start: ppValue2OptionValue(share2.yStart), end: ppValue2OptionValue(share2.yEnd)}}]}
    ));

    done();
  });

  it('`snap` - step', function(done) {
    if (LIMIT) { done(); return; }
    var share;

    // No `start`, `end` / px
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 32}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: DEFAULT_START,
      xEnd: DEFAULT_END,
      xStep: {value: 32, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd),
        step: ppValue2OptionValue(share.xStep)}, y: 5}]}
    ));

    // Invalid px step < 2px
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 2}, y: 5}; // step === 2
    expect(window.initBBoxDone).toBe(true);
    share = {
      xStart: DEFAULT_START,
      xEnd: DEFAULT_END,
      xStep: {value: 2, isRatio: false}
    };
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: ppValue2OptionValue(share.xStart), end: ppValue2OptionValue(share.xEnd),
        step: ppValue2OptionValue(share.xStep)}, y: 5}]}
    ));
    var parsedSnapTargetsSave = props.parsedSnapTargets,
      snapSave = draggable.snap;
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 1}, y: 5}; // step < 2
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);

    // Invalid percent step <= 0%
    parsedSnapTargetsSave = props.parsedSnapTargets;
    snapSave = draggable.snap;
    window.initBBoxDone = false;
    draggable.snap = {x: {step: '0%'}, y: 5}; // step === 0%
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);
    window.initBBoxDone = false;
    draggable.snap = {x: {step: '-0.1%'}, y: 5}; // step < 0%
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(parsedSnapTargetsSave);
    expect(draggable.snap).toEqual(snapSave);

    // No expand - Point * x-step
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 2, start: 1, end: 6}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        xStep: {value: 2, isRatio: false},
        xStart: {value: 1, isRatio: false},
        xEnd: {value: 6, isRatio: false},
        y: {value: 5, isRatio: false}
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {step: 2, start: 1, end: 6}, y: 5}]}
    ));

    // No expand - Point * y-step
    window.initBBoxDone = false;
    draggable.snap = {x: 3, y: {step: 3, start: 2, end: 8}};
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        x: {value: 3, isRatio: false},
        yStep: {value: 3, isRatio: false},
        yStart: {value: 2, isRatio: false},
        yEnd: {value: 8, isRatio: false}
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: 3, y: {step: 3, start: 2, end: 8}}]}
    ));

    // No expand - Point * x-step * y-step
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 2, start: 1, end: 6}, y: {step: 3, start: 2, end: 8}};
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        xStep: {value: 2, isRatio: false},
        xStart: {value: 1, isRatio: false},
        xEnd: {value: 6, isRatio: false},
        yStep: {value: 3, isRatio: false},
        yStart: {value: 2, isRatio: false},
        yEnd: {value: 8, isRatio: false}
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {step: 2, start: 1, end: 6}, y: {step: 3, start: 2, end: 8}}]}
    ));

    // No expand - Line * x-step
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 2, start: 1, end: 6}};
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        xStep: {value: 2, isRatio: false},
        xStart: {value: 1, isRatio: false},
        xEnd: {value: 6, isRatio: false},
        yStart: DEFAULT_START,
        yEnd: DEFAULT_END
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {step: 2, start: 1, end: 6},
        y: {start: ppValue2OptionValue(DEFAULT_START), end: ppValue2OptionValue(DEFAULT_END)}}]}
    ));

    // No expand - Line * y-step
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 1, end: 64}, y: {step: 3, start: 2, end: 8}};
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        xStart: {value: 1, isRatio: false},
        xEnd: {value: 64, isRatio: false},
        yStep: {value: 3, isRatio: false},
        yStart: {value: 2, isRatio: false},
        yEnd: {value: 8, isRatio: false}
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: 1, end: 64},
        y: {step: 3, start: 2, end: 8}}]}
    ));

    done();
  });

  it('`snap` - omission', function(done) {
    if (LIMIT) { done(); return; }
    var share,
      target1 = {x: 8, y: 16, gravity: 17},
      target2 = {x: '30%'},
      value1 = 64,
      value2 = '5%',
      ppValuesTarget1 = {x: {value: target1.x, isRatio: false}, y: {value: target1.y, isRatio: false}},
      ppValuesTarget2 = {x: {value: 0.3, isRatio: true}},
      ppValue1 = {value: value1, isRatio: false},
      ppValue2 = {value: 0.05, isRatio: true},
      optionValuesTarget1 = {x: ppValue2OptionValue(ppValuesTarget1.x), y: ppValue2OptionValue(ppValuesTarget1.y)},
      optionValuesTarget2 = {x: ppValue2OptionValue(ppValuesTarget2.x)},
      defaultXYOptions = {start: ppValue2OptionValue(DEFAULT_START), end: ppValue2OptionValue(DEFAULT_END)};

    // Check
    expect(merge(optionValuesTarget1, {gravity: target1.gravity})).toEqual(target1);
    expect(optionValuesTarget2).toEqual(target2);

    // Normal
    window.initBBoxDone = false;
    draggable.snap = {
      targets: [target1, target2]
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(ppValuesTarget1, {
        gravity: target1.gravity,
        corners: DEFAULT_SNAP_CORNERS,
        sides: DEFAULT_SNAP_SIDES,
        center: false,
        edges: DEFAULT_SNAP_EDGES,
        base: SNAP_BASE
      }),
      merge(ppValuesTarget2, {
        yStart: DEFAULT_START,
        yEnd: DEFAULT_END,
        gravity: SNAP_GRAVITY,
        corners: DEFAULT_SNAP_CORNERS,
        sides: DEFAULT_SNAP_SIDES,
        center: false,
        edges: DEFAULT_SNAP_EDGES,
        base: SNAP_BASE
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        merge(optionValuesTarget1, {gravity: target1.gravity}),
        merge(optionValuesTarget2, {y: defaultXYOptions})
      ]}
    ));

    // target = value (pixels)
    window.initBBoxDone = false;
    draggable.snap = {
      targets: [target1.x, target2]
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        x: ppValuesTarget1.x,
        y: ppValuesTarget1.x // Copy x
      }),
      merge(ppValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {x: optionValuesTarget1.x, y: optionValuesTarget1.x},
        merge(optionValuesTarget2, {y: defaultXYOptions})
      ]}
    ));

    // target = value ({start, end})
    window.initBBoxDone = false;
    share = {start: value1, end: value2};
    draggable.snap = {
      targets: [share, target2]
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      // Expand
      merge(DEFAULT_PARSED_SNAP_TARGET, {xStart: ppValue1, xEnd: ppValue2, y: ppValue1}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {xStart: ppValue1, xEnd: ppValue2, y: ppValue2}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: ppValue1, yStart: ppValue1, yEnd: ppValue2}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: ppValue2, yStart: ppValue1, yEnd: ppValue2}),
      merge(ppValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {x: share, y: share},
        merge(optionValuesTarget2, {y: defaultXYOptions})
      ]}
    ));

    // target = value (Element)
    window.initBBoxDone = false;
    draggable.snap = {
      targets: [parent, target2]
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {element: parent}),
      merge(ppValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {boundingBox: parent},
        merge(optionValuesTarget2, {y: defaultXYOptions})
      ]}
    ));

    // target = value (PPBBox)
    window.initBBoxDone = false;
    draggable.snap = {
      targets: [{x: 1, top: '2%', width: 128, bottom: '25%'}, target2]
    };
    expect(window.initBBoxDone).toBe(true);
    share = {
      x: {value: 1, isRatio: false},
      y: {value: 0.02, isRatio: true},
      width: {value: 128, isRatio: false},
      bottom: {value: 0.25, isRatio: true}
    };
    share.left = share.x;
    share.top = share.y;
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {ppBBox: share}),
      merge(ppValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
    ]);
    share.left = share.x = ppValue2OptionValue(share.x);
    share.top = share.y = ppValue2OptionValue(share.y);
    share.width = ppValue2OptionValue(share.width);
    share.bottom = ppValue2OptionValue(share.bottom);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {boundingBox: share},
        merge(optionValuesTarget2, {y: defaultXYOptions})
      ]}
    ));

    // targets = target
    window.initBBoxDone = false;
    draggable.snap = {
      targets: target1
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesTarget1, {gravity: target1.gravity})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        merge(optionValuesTarget1, {gravity: target1.gravity})
      ]}
    ));

    // targets = value
    window.initBBoxDone = false;
    draggable.snap = {
      targets: target1.x
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        x: ppValuesTarget1.x,
        y: ppValuesTarget1.x // Copy x
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {x: optionValuesTarget1.x, y: optionValuesTarget1.x}
      ]}
    ));

    // snap = targets
    window.initBBoxDone = false;
    draggable.snap = [target1, target2];
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesTarget1, {gravity: target1.gravity}),
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesTarget2, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        merge(optionValuesTarget1, {gravity: target1.gravity}),
        merge(optionValuesTarget2, {y: defaultXYOptions})
      ]}
    ));

    // snap = target
    window.initBBoxDone = false;
    draggable.snap = target1;
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesTarget1, {gravity: target1.gravity})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        merge(optionValuesTarget1, {gravity: target1.gravity})
      ]}
    ));

    // snap = value
    window.initBBoxDone = false;
    draggable.snap = target1.x;
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        x: ppValuesTarget1.x,
        y: ppValuesTarget1.x // Copy x
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {x: optionValuesTarget1.x, y: optionValuesTarget1.x}
      ]}
    ));

    done();
  });

  it('`snap` - inheritance', function(done) {
    if (LIMIT) { done(); return; }
    var x1 = 8,
      x2 = 32,
      y1 = 16,
      gravity1 = 64,
      side1 = 'start',
      side2 = 'end',
      edge1 = 'inside',
      edge2 = 'outside',
      snap = {
        center: true,
        edge: edge1,
        targets: [
          { // No common options
            x: x1, y: y1
          },
          {
            edge: edge2, // Override parent options
            center: false, // Override parent options
            x: x1, y: y1
          },
          {
            side: side1, // Override default options
            x: x1, y: y1
          },
          {
            edge: edge2, // Override parent options
            side: side2, // Override default options
            x: x1, y: y1
          },
          {
            gravity: gravity1, // Override default options
            x: {start: x1, end: x2, step: x2 - x1}, y: y1
          },
          {
            edge: edge2, // Override parent options
            x: {start: x1, end: x2, step: x2 - x1}, y: y1
          },
          { // No common options
            x: x1, y: y1
          }
        ]
      },
      ppValueX1 = {value: x1, isRatio: false},
      ppValueX2 = {value: x2, isRatio: false},
      ppValueY1 = {value: y1, isRatio: false},
      ppValuesX1Y1 = {x: ppValueX1, y: ppValueY1};

    window.initBBoxDone = false;
    draggable.snap = snap;
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesX1Y1, {center: true, edges: [snap.edge]}), // No common options
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesX1Y1, {center: false, edges: [snap.targets[1].edge]}),
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesX1Y1,
        {center: true, edges: [snap.edge], sides: [snap.targets[2].side]}),
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesX1Y1,
        {center: true, edges: [snap.targets[3].edge], sides: [snap.targets[3].side]}),
      // No expand
      merge(DEFAULT_PARSED_SNAP_TARGET,
        {xStep: {value: x2 - x1, isRatio: false}, xStart: ppValueX1, xEnd: ppValueX2,
          y: ppValueY1, center: true, edges: [snap.edge], gravity: snap.targets[4].gravity}),
      // No expand
      merge(DEFAULT_PARSED_SNAP_TARGET,
        {xStep: {value: x2 - x1, isRatio: false}, xStart: ppValueX1, xEnd: ppValueX2,
          y: ppValueY1, center: true, edges: [snap.targets[5].edge]}),
      // No common options, again
      merge(DEFAULT_PARSED_SNAP_TARGET, ppValuesX1Y1, {center: true, edges: [snap.edge]})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS, snap));

    done();
  });

  it('`snap` - same options', function(done) {
    if (LIMIT) { done(); return; }
    // Ignore same parsed options
    draggable.snap = {edge: 'outside', x: 16, y: 32};
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {
        edges: ['outside'],
        x: {value: 16, isRatio: false},
        y: {value: 32, isRatio: false}
      })
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{edge: 'outside', x: 16, y: 32}]}
    ));

    window.initBBoxDone = false;
    draggable.snap = {
      edge: 'outside',
      targets: {x: 16, y: 32}
    };
    expect(window.initBBoxDone).toBe(false);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {
        edge: 'outside',
        targets: [{x: 16, y: 32}]
      }
    ));

    // ON -> OFF
    window.initBBoxDone = false;
    draggable.snap = null;
    expect(window.initBBoxDone).toBe(false); // initBBox is not called when OFF
    expect(props.parsedSnapTargets).not.toBeDefined();
    expect(draggable.snap).not.toBeDefined();

    // OFF -> ON
    window.initBBoxDone = false;
    draggable.snap = 16;
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 16, isRatio: false}, y: {value: 16, isRatio: false}})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: 16, y: 16}]}
    ));

    done();
  });

  it('`autoScroll` - omission', function(done) {
    if (LIMIT) { done(); return; }

    expect(draggable.autoScroll).not.toBeDefined(); // Default

    // true
    window.initBBoxDone = false;
    draggable.autoScroll = true;
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // false
    window.initBBoxDone = false;
    draggable.autoScroll = false;
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).not.toBeDefined();

    // Other -> window
    window.initBBoxDone = false;
    draggable.autoScroll = 16;
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // element
    window.initBBoxDone = false;
    draggable.autoScroll = parent;
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: parent,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    done();
  });

  it('`autoScroll` - target', function(done) {
    if (LIMIT) { done(); return; }

    // window
    window.initBBoxDone = false;
    draggable.autoScroll = {target: window};
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // element
    window.initBBoxDone = false;
    draggable.autoScroll = {target: parent};
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: parent,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Other -> window
    window.initBBoxDone = false;
    draggable.autoScroll = {target: 17};
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    done();
  });

  it('`autoScroll` - speed, sensitivity', function(done) {
    if (LIMIT) { done(); return; }

    // Default
    draggable.autoScroll = {};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Array 3 elements
    draggable.autoScroll = {speed: [1, 2, 3]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2, 3],
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Array 2 elements
    draggable.autoScroll = {speed: [1, 2]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2],
      sensitivity: AUTOSCROLL_SENSITIVITY.slice(0, 2)
    });

    // Array 4 elements -> ignore 4th
    draggable.autoScroll = {speed: [1, 2, 3, 4]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2, 3],
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Array 0 elements -> Default
    draggable.autoScroll = {speed: []};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Array Not number element 1
    draggable.autoScroll = {speed: [1, 2, 'A']};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2],
      sensitivity: AUTOSCROLL_SENSITIVITY.slice(0, 2)
    });

    // Array Not number element 2
    draggable.autoScroll = {speed: [1, 'A', 2]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1],
      sensitivity: [AUTOSCROLL_SENSITIVITY[0]]
    });

    // Array Not number element 3 -> 0 elements -> Default
    draggable.autoScroll = {speed: ['A', 1, 2]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Not Array
    draggable.autoScroll = {speed: 3};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [3],
      sensitivity: [AUTOSCROLL_SENSITIVITY[0]]
    });

    // Other -> Default
    draggable.autoScroll = {speed: 'A'};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // sensitivity

    // Array speed: 3 elements, sensitivity: 3 elements
    draggable.autoScroll = {speed: [1, 2, 3], sensitivity: [11, 12, 13]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2, 3],
      sensitivity: [11, 12, 13]
    });

    // Array speed: 3 elements, sensitivity: 2 elements
    draggable.autoScroll = {speed: [1, 2, 3], sensitivity: [11, 12]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2, 3],
      sensitivity: [11, 12, AUTOSCROLL_SENSITIVITY[2]]
    });

    // Array speed: 2 elements, sensitivity: 3 elements
    draggable.autoScroll = {speed: [1, 2], sensitivity: [11, 12, 13]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2],
      sensitivity: [11, 12]
    });

    // Array 0 elements -> Default
    draggable.autoScroll = {speed: [1, 2], sensitivity: []};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [1, 2],
      sensitivity: AUTOSCROLL_SENSITIVITY.slice(0, 2)
    });

    // Array Not number element 1
    draggable.autoScroll = {sensitivity: ['A', 12, 13]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: [AUTOSCROLL_SENSITIVITY[0], 12, 13]
    });

    // Array Not number element 2
    draggable.autoScroll = {sensitivity: [11, 'A', 13]};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: [11, AUTOSCROLL_SENSITIVITY[1], 13]
    });

    // Array Not number element 3
    draggable.autoScroll = {sensitivity: [11, 12, 'A']};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: [11, 12, AUTOSCROLL_SENSITIVITY[2]]
    });

    // Not Array
    draggable.autoScroll = {sensitivity: 13};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: [13, AUTOSCROLL_SENSITIVITY[1], AUTOSCROLL_SENSITIVITY[2]]
    });

    // Other -> Default
    draggable.autoScroll = {sensitivity: 'A'};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    done();
  });

  it('`autoScroll` - min*, max*', function(done) {
    if (LIMIT) { done(); return; }

    // Default
    draggable.autoScroll = {};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // min* number
    draggable.autoScroll = {minX: 11, minY: 12};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      minX: 11, minY: 12
    });
    draggable.autoScroll = {minX: 13};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      minX: 13
    });

    // min* number zero
    draggable.autoScroll = {minX: 0};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      minX: 0
    });

    // min* number minus
    draggable.autoScroll = {minX: -5};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // min* Not number
    draggable.autoScroll = {minX: 'A'};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // max* number
    draggable.autoScroll = {maxX: 21, maxY: 22};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      maxX: 21, maxY: 22
    });
    draggable.autoScroll = {maxX: 23};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      maxX: 23
    });

    // max* number zero
    draggable.autoScroll = {maxX: 0};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      maxX: 0
    });

    // max* number maxus
    draggable.autoScroll = {maxX: -5};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // max* Not number
    draggable.autoScroll = {maxX: 'A'};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // max* < min -> deny
    draggable.autoScroll = {minX: 30, maxX: 29};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      minX: 30
    });
    draggable.autoScroll = {minX: 30, maxY: 29}; // Not maxX
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      minX: 30, maxY: 29
    });

    // max* == min
    draggable.autoScroll = {minX: 30, maxX: 30};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      minX: 30, maxX: 30
    });

    // max* > min
    draggable.autoScroll = {minX: 30, maxX: 31};
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY,
      minX: 30, maxX: 31
    });

    done();
  });

  it('`autoScroll` - same options', function(done) {
    if (LIMIT) { done(); return; }

    // Default
    draggable.autoScroll = true;
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Specify winow
    window.initBBoxDone = false;
    draggable.autoScroll = window;
    expect(window.initBBoxDone).toBe(false);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Specify speed
    window.initBBoxDone = false;
    draggable.autoScroll = {speed: AUTOSCROLL_SPEED};
    expect(window.initBBoxDone).toBe(false);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Specify another speed
    window.initBBoxDone = false;
    draggable.autoScroll = {speed: 11};
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: [11],
      sensitivity: [AUTOSCROLL_SENSITIVITY[0]]
    });

    // Specify original speed
    window.initBBoxDone = false;
    draggable.autoScroll = {speed: AUTOSCROLL_SPEED};
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // Specify another target
    window.initBBoxDone = false;
    draggable.autoScroll = parent;
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: parent,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    // ON -> OFF
    window.initBBoxDone = false;
    draggable.autoScroll = null;
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).not.toBeDefined();

    // OFF -> ON
    window.initBBoxDone = false;
    draggable.autoScroll = true;
    expect(window.initBBoxDone).toBe(true);
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });

    done();
  });

  it('should accept an PPBBox as `containment`', function(done) {
    var iframe = document.getElementById('iframe'),
      iWindow = iframe.contentWindow,
      iDocument = iWindow.document,
      iBody = iDocument.body,
      element, draggable, props,
      left, top, width, height;

    element = iDocument.getElementById('elm1');
    iBody.style.margin = iBody.style.borderWidth = iBody.style.padding = '0';
    iBody.style.overflow = 'hidden'; // Hide vertical scroll bar that change width of document.
    draggable = new iWindow.PlainDraggable(element);
    props = iWindow.insProps[draggable._id];

    iframe.style.width = '480px';
    iBody.style.height = '320px';
    draggable.containment = {left: 0, top: 0, width: '100%', height: '100%'};
    left = 0;
    top = 0;
    width = 480;
    height = 320;
    expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
      x: left, y: top, right: left + width, bottom: top + height});

    draggable.containment = {left: '10%', top: '10%', width: '50%', height: '50%'};
    left = 48;
    top = 32;
    width = 240;
    height = 160;
    expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
      x: left, y: top, right: left + width, bottom: top + height});

    draggable.containment = {left: 240, top: 160, width: '50%', height: '50%'};
    left = 240;
    top = 160;
    width = 240;
    height = 160;
    expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
      x: left, y: top, right: left + width, bottom: top + height});

    draggable.containment = {left: '50%', top: '50%', right: '100%', bottom: '100%'}; // Same as above.
    left = 240;
    top = 160;
    width = 240;
    height = 160;
    expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
      x: left, y: top, right: left + width, bottom: top + height});

    draggable.containment = {left: 241, top: 0, right: '50%', bottom: '100%'}; // Invalid -> document size
    left = 0;
    top = 0;
    width = 480;
    height = 320;
    expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
      x: left, y: top, right: left + width, bottom: top + height});

    draggable.containment = {left: 0, top: '20%', right: '50%', bottom: '10%'}; // Invalid -> document size
    left = 0;
    top = 0;
    width = 480;
    height = 320;
    expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
      x: left, y: top, right: left + width, bottom: top + height});

    draggable.containment = {left: '10%', top: 0, width: '80%', height: '50%'};
    left = 48;
    top = 0;
    width = 480 * 0.8;
    height = 160;
    expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
      x: left, y: top, right: left + width, bottom: top + height});

    // Resize window
    iframe.style.width = '500px';
    setTimeout(function() {
      left = 50;
      top = 0;
      width = 500 * 0.8;
      height = 160;
      expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
        x: left, y: top, right: left + width, bottom: top + height});

      // Invalid, by resize window
      draggable.containment = {left: 240, top: 0, right: '50%'/* 250*/, bottom: '100%'}; // Valid
      left = 240;
      top = 0;
      width = 10;
      height = 320;
      expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
        x: left, y: top, right: left + width, bottom: top + height});

      iframe.style.width = '460px'; // right: 230 -> Invalid -> document size
      setTimeout(function() {
        left = 0;
        top = 0;
        width = 460;
        height = 320;
        expect(props.containmentBBox).toEqual({left: left, top: top, width: width, height: height,
          x: left, y: top, right: left + width, bottom: top + height});

        done();
      }, 900);
    }, 900);
  });

});
