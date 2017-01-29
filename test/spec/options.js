
describe('setOptions()', function() {
  'use strict';

  var window, document, body, pageDone,
    parent, elm1, handle, draggable, props,
    SNAP_GRAVITY, SNAP_CORNER, SNAP_SIDE, SNAP_EDGE, SNAP_BASE,
    SNAP_ALL_CORNERS, SNAP_ALL_SIDES, SNAP_ALL_EDGES,
    DEFAULT_SNAP_CORNERS, DEFAULT_SNAP_SIDES, DEFAULT_SNAP_EDGES,
    DEFAULT_PARSED_SNAP_TARGET, DEFAULT_SNAP_OPTIONS,
    DEFAULT_START = {value: 0, isRatio: false},
    DEFAULT_END = {value: 1, isRatio: true},
    snapValue2value;

  function merge() {
    var obj = {};
    Array.prototype.forEach.call(arguments, function(addObj) {
      Object.keys(addObj).forEach(function(key) { obj[key] = addObj[key]; });
    });
    return obj;
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      body = pageBody;
      pageDone = done;

      parent = document.getElementById('parent');
      elm1 = document.getElementById('elm1');
      handle = document.getElementById('handle');
      draggable = new window.PlainDraggable(elm1);
      props = window.insProps[draggable._id];

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
        edges: DEFAULT_SNAP_EDGES,
        base: SNAP_BASE
      };
      DEFAULT_SNAP_OPTIONS = {
        gravity: SNAP_GRAVITY,
        corner: SNAP_CORNER,
        side: SNAP_SIDE,
        edge: SNAP_EDGE,
        base: SNAP_BASE
      };
      snapValue2value = window.snapValue2value;

      beforeDone();
    }, 'setOptions()');
  });

  afterAll(function() {
    pageDone();
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

  it('should accept an bBox as `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {left: 0, top: 0, width: 128, height: 64};
    expect(window.initBBoxDone).toBe(true);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 0, top: 0, width: 128, height: 64, x: 0, y: 0, right: 128, bottom: 64});
    expect(draggable.containment).toEqual(props.containmentBBox);

    done();
  });

  it('should not update when same bBox is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {x: 0, y: 0, right: 128, bottom: 64}; // Substitutes props
    expect(window.initBBoxDone).toBe(false);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 0, top: 0, width: 128, height: 64, x: 0, y: 0, right: 128, bottom: 64});
    expect(draggable.containment).toEqual(props.containmentBBox);

    done();
  });

  it('should update when new bBox is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {left: 1, top: 0, width: 128, height: 64};
    expect(window.initBBoxDone).toBe(true);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 1, top: 0, width: 128, height: 64, x: 1, y: 0, right: 129, bottom: 64});
    expect(draggable.containment).toEqual(props.containmentBBox);

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
    var share;

    // pixels
    window.initBBoxDone = false;
    draggable.snap = 16;
    expect(window.initBBoxDone).toBe(true);
    share = {value: 16, isRatio: false};
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      {x: share, y: share}
    )]);
    share = snapValue2value(share);
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
    share = snapValue2value(share);
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
    ));

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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
    ));

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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd),
        step: snapValue2value(share.xStep)}, y: 5}]}
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd),
        step: snapValue2value(share.xStep)}, y: 5}]}
    ));

    // Element
    window.initBBoxDone = false;
    draggable.snap = parent;
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      {element: parent}
    )]);
    share = snapValue2value(share);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{target: parent}]}
    ));

    // SnapBBox
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
      {snapBBox: share}
    )]);
    share.left = share.x = snapValue2value(share.x);
    share.top = share.y = snapValue2value(share.y);
    share.width = snapValue2value(share.width);
    share.bottom = snapValue2value(share.bottom);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{target: share}]}
    ));

    done();
  });

  it('`snap` - start/end', function(done) {
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
    ));

    // Invalid start >= end px
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 2, end: 2}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {xStart: DEFAULT_START, xEnd: DEFAULT_END};
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
    ));

    // Invalid start >= end percent
    window.initBBoxDone = false;
    draggable.snap = {x: {start: '5%', end: '5%'}, y: 5};
    expect(window.initBBoxDone).toBe(false); // Not update
    share = {xStart: DEFAULT_START, xEnd: DEFAULT_END};
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
    ));

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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)},
        y: {start: snapValue2value(share2.yStart), end: snapValue2value(share2.yEnd)}}]}
    ));

    done();
  });

  it('`snap` - step', function(done) {
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
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd),
        step: snapValue2value(share.xStep)}, y: 5}]}
    ));

    // Invalid px step < 2px
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 1}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {xStart: DEFAULT_START, xEnd: DEFAULT_END};
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
    ));

    // Invalid percent step <= 0%
    window.initBBoxDone = false;
    draggable.snap = {x: {step: '-5%'}, y: 5};
    expect(window.initBBoxDone).toBe(false); // Not update
    share = {xStart: DEFAULT_START, xEnd: DEFAULT_END};
    expect(props.parsedSnapTargets).toEqual([merge(DEFAULT_PARSED_SNAP_TARGET,
      share, {y: {value: 5, isRatio: false}}
    )]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)}, y: 5}]}
    ));

    // Expand - Point * x-step
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 2, start: 1, end: 6}, y: 5};
    expect(window.initBBoxDone).toBe(true);
    share = {value: 5, isRatio: false};
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 1, isRatio: false}, y: share}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 3, isRatio: false}, y: share}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 5, isRatio: false}, y: share})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {step: 2, start: 1, end: 6}, y: 5}]}
    ));

    // Expand - Point * y-step
    window.initBBoxDone = false;
    draggable.snap = {x: 3, y: {step: 3, start: 2, end: 8}};
    expect(window.initBBoxDone).toBe(true);
    share = {value: 3, isRatio: false};
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: share, y: {value: 2, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: share, y: {value: 5, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: share, y: {value: 8, isRatio: false}})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: 3, y: {step: 3, start: 2, end: 8}}]}
    ));

    // Expand - Point * x-step * y-step
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 2, start: 1, end: 6}, y: {step: 3, start: 2, end: 8}};
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 1, isRatio: false}, y: {value: 2, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 1, isRatio: false}, y: {value: 5, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 1, isRatio: false}, y: {value: 8, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 3, isRatio: false}, y: {value: 2, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 3, isRatio: false}, y: {value: 5, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 3, isRatio: false}, y: {value: 8, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 5, isRatio: false}, y: {value: 2, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 5, isRatio: false}, y: {value: 5, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 5, isRatio: false}, y: {value: 8, isRatio: false}})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {step: 2, start: 1, end: 6}, y: {step: 3, start: 2, end: 8}}]}
    ));

    // Expand - Line * x-step
    window.initBBoxDone = false;
    draggable.snap = {x: {step: 2, start: 1, end: 6}};
    expect(window.initBBoxDone).toBe(true);
    share = {yStart: DEFAULT_START, yEnd: DEFAULT_END};
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 1, isRatio: false}}, share),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 3, isRatio: false}}, share),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: {value: 5, isRatio: false}}, share)
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {step: 2, start: 1, end: 6},
        y: {start: snapValue2value(share.yStart), end: snapValue2value(share.yEnd)}}]}
    ));

    // Expand - Line * y-step
    window.initBBoxDone = false;
    draggable.snap = {x: {start: 1, end: 64}, y: {step: 3, start: 2, end: 8}};
    expect(window.initBBoxDone).toBe(true);
    share = {xStart: {value: 1, isRatio: false}, xEnd: {value: 64, isRatio: false}};
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, share, {y: {value: 2, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, share, {y: {value: 5, isRatio: false}}),
      merge(DEFAULT_PARSED_SNAP_TARGET, share, {y: {value: 8, isRatio: false}})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: {start: snapValue2value(share.xStart), end: snapValue2value(share.xEnd)},
        y: {step: 3, start: 2, end: 8}}]}
    ));

    done();
  });

  it('`snap` - omission', function(done) {
    var share,
      target1 = {x: 8, y: 16, gravity: 17},
      target2 = {x: '30%'},
      value1 = 64, value2 = '5%',
      snapValuesTarget1 = {x: {value: target1.x, isRatio: false}, y: {value: target1.y, isRatio: false}},
      snapValuesTarget2 = {x: {value: 0.3, isRatio: true}},
      snapValue1 = {value: value1, isRatio: false},
      snapValue2 = {value: 0.05, isRatio: true},
      optionValuesTarget1 = {x: snapValue2value(snapValuesTarget1.x), y: snapValue2value(snapValuesTarget1.y)},
      optionValuesTarget2 = {x: snapValue2value(snapValuesTarget2.x)},
      defaultXYOptions = {start: snapValue2value(DEFAULT_START), end: snapValue2value(DEFAULT_END)};

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
      merge(snapValuesTarget1, {
        gravity: target1.gravity,
        corners: DEFAULT_SNAP_CORNERS,
        sides: DEFAULT_SNAP_SIDES,
        edges: DEFAULT_SNAP_EDGES,
        base: SNAP_BASE
      }),
      merge(snapValuesTarget2, {
        yStart: DEFAULT_START,
        yEnd: DEFAULT_END,
        gravity: SNAP_GRAVITY,
        corners: DEFAULT_SNAP_CORNERS,
        sides: DEFAULT_SNAP_SIDES,
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
        x: snapValuesTarget1.x,
        y: snapValuesTarget1.x  // Copy x
      }),
      merge(snapValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
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
      merge(DEFAULT_PARSED_SNAP_TARGET, {xStart: snapValue1, xEnd: snapValue2, y: snapValue1}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {xStart: snapValue1, xEnd: snapValue2, y: snapValue2}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: snapValue1, yStart: snapValue1, yEnd: snapValue2}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: snapValue2, yStart: snapValue1, yEnd: snapValue2}),
      merge(snapValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
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
      merge(snapValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {target: parent},
        merge(optionValuesTarget2, {y: defaultXYOptions})
      ]}
    ));

    // target = value (SnapBBox)
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
      merge(DEFAULT_PARSED_SNAP_TARGET, {snapBBox: share}),
      merge(snapValuesTarget2, DEFAULT_PARSED_SNAP_TARGET, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
    ]);
    share.left = share.x = snapValue2value(share.x);
    share.top = share.y = snapValue2value(share.y);
    share.width = snapValue2value(share.width);
    share.bottom = snapValue2value(share.bottom);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [
        {target: share},
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
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesTarget1, {gravity: target1.gravity})
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
        x: snapValuesTarget1.x,
        y: snapValuesTarget1.x  // Copy x
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
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesTarget1, {gravity: target1.gravity}),
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesTarget2, {yStart: DEFAULT_START, yEnd: DEFAULT_END})
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
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesTarget1, {gravity: target1.gravity})
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
        x: snapValuesTarget1.x,
        y: snapValuesTarget1.x  // Copy x
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
    var x1 = 8, x2 = 32, y1 = 16,
      gravity1 = 64,
      side1 = 'start', side2 = 'end',
      edge1 = 'inside', edge2 = 'outside',
      snap = {
        edge: edge1,
        targets: [
          { // No common options
            x: x1, y: y1
          },
          {
            edge: edge2, // Override parent options
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
            x: {start: x1, end: x2, step: x2 - x1}, y: y1 // Expand
          },
          {
            edge: edge2, // Override parent options
            x: {start: x1, end: x2, step: x2 - x1}, y: y1 // Expand
          },
          { // No common options
            x: x1, y: y1
          }
        ]
      },
      snapValueX1 = {value: x1, isRatio: false},
      snapValueX2 = {value: x2, isRatio: false},
      snapValueY1 = {value: y1, isRatio: false},
      snapValuesX1Y1 = {x: snapValueX1, y: snapValueY1};

    window.initBBoxDone = false;
    draggable.snap = snap;
    expect(window.initBBoxDone).toBe(true);
    console.dir(props.parsedSnapTargets);
    expect(props.parsedSnapTargets).toEqual([
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesX1Y1, {edges: [snap.edge]}), // No common options
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesX1Y1, {edges: [snap.targets[1].edge]}),
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesX1Y1,
        {edges: [snap.edge], sides: [snap.targets[2].side]}),
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesX1Y1,
        {edges: [snap.targets[3].edge], sides: [snap.targets[3].side]}),
      // Expand
      merge(DEFAULT_PARSED_SNAP_TARGET,
        {x: snapValueX1, y: snapValueY1, edges: [snap.edge], gravity: snap.targets[4].gravity}),
      merge(DEFAULT_PARSED_SNAP_TARGET,
        {x: snapValueX2, y: snapValueY1, edges: [snap.edge], gravity: snap.targets[4].gravity}),
      // Expand
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: snapValueX1, y: snapValueY1, edges: [snap.targets[5].edge]}),
      merge(DEFAULT_PARSED_SNAP_TARGET, {x: snapValueX2, y: snapValueY1, edges: [snap.targets[5].edge]}),
      // No common options, again
      merge(DEFAULT_PARSED_SNAP_TARGET, snapValuesX1Y1, {edges: [snap.edge]})
    ]);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS, snap));

    done();
  });

  it('`snap` - same options', function(done) {
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

});
