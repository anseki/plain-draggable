
describe('setOptions()', function() {
  'use strict';

  var window, document, body, pageDone,
    parent, elm1, handle, draggable, props,
    SNAP_GRAVITY, SNAP_CORNER, SNAP_SIDE, SNAP_EDGE, SNAP_BASE,
    SNAP_ALL_CORNERS, SNAP_ALL_SIDES, SNAP_ALL_EDGES,
    DEFAULT_SNAP_CORNERS, DEFAULT_SNAP_SIDES, DEFAULT_SNAP_EDGES,
    DEFAULT_PARSED_SNAP_TARGET, DEFAULT_SNAP_OPTIONS,
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

  it('should update `snap` - value types', function(done) {
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
    console.log(draggable.snap);
    expect(draggable.snap).toEqual(merge(DEFAULT_SNAP_OPTIONS,
      {targets: [{x: share, y: share}]}
    ));

    // // n%
    // window.initBBoxDone = false;
    // draggable.snap = ' + 25 % ';
    // expect(window.initBBoxDone).toBe(true);
    // share = [{value: 0.25, isRatio: true, gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE}];
    // expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    // share = {points: [{value: '25%'}]};
    // expect(draggable.snap).toEqual({x: share, y: share,
    //   gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // // step:<n><closed-interval>
    // window.initBBoxDone = false;
    // draggable.snap = ' step : + 32 [ 8, + 256 ] ';
    // expect(window.initBBoxDone).toBe(true);
    // share = [{
    //   step: {value: 32, isRatio: false},
    //   start: {value: 8, isRatio: false},
    //   end: {value: 256, isRatio: false},
    //   gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    // expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    // share = {points: [{value: 'step:32[8,256]'}]};
    // expect(draggable.snap).toEqual({x: share, y: share,
    //   gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // // Element
    // window.initBBoxDone = false;
    // draggable.snap = parent;
    // expect(window.initBBoxDone).toBe(true);
    // share = [{value: parent, isElement: true, gravity: SNAP_GRAVITY, edge: SNAP_EDGE, side: SNAP_SIDE}];
    // expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    // share = {points: [{value: parent}]};
    // expect(draggable.snap).toEqual({x: share, y: share,
    //   gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    done();
  });

  it('should update `snap` - parse string as value', function(done) {
    var share;

    // `+` sign, float
    window.initBBoxDone = false;
    draggable.snap = ' + 16.0 ';
    expect(window.initBBoxDone).toBe(true);
    share = [{value: 16, isRatio: false, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 16}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // `-` sign, float
    window.initBBoxDone = false;
    draggable.snap = ' - 16.0 ';
    expect(window.initBBoxDone).toBe(true);
    share = [{value: -16, isRatio: false, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: -16}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // Percent >0
    window.initBBoxDone = false;
    draggable.snap = ' 16 % ';
    expect(window.initBBoxDone).toBe(true);
    share = [{value: 0.16, isRatio: true, gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: '16%'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // Percent <0
    window.initBBoxDone = false;
    draggable.snap = ' - 16 % ';
    expect(window.initBBoxDone).toBe(true);
    share = [{value: -0.16, isRatio: true, gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: '-16%'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // Percent `0%`
    window.initBBoxDone = false;
    draggable.snap = ' 0 % ';
    expect(window.initBBoxDone).toBe(true);
    share = [{value: 0, isRatio: false, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 0}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    done();
  });

  it('should update `snap` - parse string as repeat', function(done) {
    var share;

    // No `start`, `end` / px
    window.initBBoxDone = false;
    draggable.snap = 'step:32';
    expect(window.initBBoxDone).toBe(true);
    share = [{
      step: {value: 32, isRatio: false},
      start: {value: 0, isRatio: false},
      end: {value: 1, isRatio: true},
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 'step:32[0,100%]'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // No `start`, `end` / Percent
    window.initBBoxDone = false;
    draggable.snap = 'step:50%';
    expect(window.initBBoxDone).toBe(true);
    share = [{
      step: {value: 0.5, isRatio: true},
      start: {value: 0, isRatio: false},
      end: {value: 1, isRatio: true},
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 'step:50%[0,100%]'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // Invalid px
    window.initBBoxDone = false;
    share = props.parsedSnapTargets;
    draggable.snap = 'step:1';
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(share);

    // Invalid percent
    window.initBBoxDone = false;
    share = props.parsedSnapTargets;
    draggable.snap = 'step:-5%';
    expect(window.initBBoxDone).toBe(false);
    expect(props.parsedSnapTargets).toEqual(share);

    // `start` px
    window.initBBoxDone = false;
    draggable.snap = 'step:32[16]';
    expect(window.initBBoxDone).toBe(true);
    share = [{
      step: {value: 32, isRatio: false},
      start: {value: 16, isRatio: false},
      end: {value: 1, isRatio: true},
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 'step:32[16,100%]'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // `start` percent
    window.initBBoxDone = false;
    draggable.snap = 'step:32[16%]';
    expect(window.initBBoxDone).toBe(true);
    share = [{
      step: {value: 32, isRatio: false},
      start: {value: 0.16, isRatio: true},
      end: {value: 1, isRatio: true},
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 'step:32[16%,100%]'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // `end` px
    window.initBBoxDone = false;
    draggable.snap = 'step:32[,64]';
    expect(window.initBBoxDone).toBe(true);
    share = [{
      step: {value: 32, isRatio: false},
      start: {value: 0, isRatio: false},
      end: {value: 64, isRatio: false},
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 'step:32[0,64]'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // `end` percent
    window.initBBoxDone = false;
    draggable.snap = 'step:32[,64%]';
    expect(window.initBBoxDone).toBe(true);
    share = [{
      step: {value: 32, isRatio: false},
      start: {value: 0, isRatio: false},
      end: {value: 0.64, isRatio: true},
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 'step:32[0,64%]'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    // `start`, `end`
    window.initBBoxDone = false;
    draggable.snap = 'step:32[16,64]';
    expect(window.initBBoxDone).toBe(true);
    share = [{
      step: {value: 32, isRatio: false},
      start: {value: 16, isRatio: false},
      end: {value: 64, isRatio: false},
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, repeat: true}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 'step:32[16,64]'}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    done();
  });

  it('should update `snap` - omission', function(done) {
    var share,
      point1 = {value: 8, gravity: 16},
      point2 = {value: 32};

    // normal
    window.initBBoxDone = false;
    draggable.snap = {
      x: {points: [point1, point2]}
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({x: [
      {value: point1.value, gravity: point1.gravity, edge: SNAP_EDGE},
      {value: point2.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ]});
    expect(draggable.snap).toEqual({
      x: {
        points: [point1, point2]
      },
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // point = value
    window.initBBoxDone = false;
    draggable.snap = {
      x: {points: [point1.value, point2]}
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({x: [
      {value: point1.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE},
      {value: point2.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ]});
    expect(draggable.snap).toEqual({
      x: {
        points: [{value: point1.value}, point2]
      },
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // points = point
    window.initBBoxDone = false;
    draggable.snap = {
      x: {points: point1}
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({x: [
      {value: point1.value, gravity: point1.gravity, edge: SNAP_EDGE}
    ]});
    expect(draggable.snap).toEqual({
      x: {
        points: [point1]
      },
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // points = value
    window.initBBoxDone = false;
    draggable.snap = {
      x: {points: point1.value}
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({x: [
      {value: point1.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ]});
    expect(draggable.snap).toEqual({
      x: {
        points: [{value: point1.value}]
      },
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // x = points
    window.initBBoxDone = false;
    draggable.snap = {
      x: [point1, point2]
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({x: [
      {value: point1.value, gravity: point1.gravity, edge: SNAP_EDGE},
      {value: point2.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ]});
    expect(draggable.snap).toEqual({
      x: {
        points: [point1, point2]
      },
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // x = point
    window.initBBoxDone = false;
    draggable.snap = {
      x: point1
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({x: [
      {value: point1.value, gravity: point1.gravity, edge: SNAP_EDGE}
    ]});
    expect(draggable.snap).toEqual({
      x: {
        points: [point1]
      },
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // x = value
    window.initBBoxDone = false;
    draggable.snap = {
      x: point1.value
    };
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({x: [
      {value: point1.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ]});
    expect(draggable.snap).toEqual({
      x: {
        points: [{value: point1.value}]
      },
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // snap = x
    window.initBBoxDone = false;
    draggable.snap = {points: [point1, point2]};
    expect(window.initBBoxDone).toBe(true);
    share = [
      {value: point1.value, gravity: point1.gravity, edge: SNAP_EDGE},
      {value: point2.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [point1, point2]};
    expect(draggable.snap).toEqual({
      x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // snap = points
    draggable.snap = 5; // reset
    window.initBBoxDone = false;
    draggable.snap = [point1, point2];
    expect(window.initBBoxDone).toBe(true);
    share = [
      {value: point1.value, gravity: point1.gravity, edge: SNAP_EDGE},
      {value: point2.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [point1, point2]};
    expect(draggable.snap).toEqual({
      x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // snap = point
    window.initBBoxDone = false;
    draggable.snap = point1;
    expect(window.initBBoxDone).toBe(true);
    share = [
      {value: point1.value, gravity: point1.gravity, edge: SNAP_EDGE}
    ];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [point1]};
    expect(draggable.snap).toEqual({
      x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    // snap = value
    window.initBBoxDone = false;
    draggable.snap = point1.value;
    expect(window.initBBoxDone).toBe(true);
    share = [
      {value: point1.value, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}
    ];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: point1.value}]};
    expect(draggable.snap).toEqual({
      x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE
    });

    done();
  });

  it('should update `snap` - inheritance', function(done) {
    var gravity1 = 64, gravity2 = 65,
      edge1 = 'start', edge2 = 'end',
      base1 = 'document',
      side1 = 'inner', side2 = 'outer',
      snap = {
        side: side1,
        x: {
          base: base1,
          points: [
            {
              edge: edge1,
              value: 8
            },
            {
              value: '16%'
            },
            {
              value: parent
            },
            {
              side: side2,
              value: parent
            }
          ]
        },
        y: {
          gravity: gravity1,
          edge: edge2,
          points: [
            {
              gravity: gravity2,
              value: 8
            },
            {
              value: '16%'
            },
            {
              value: parent
            },
            {
              side: side2,
              value: parent
            }
          ]
        }
      };

    window.initBBoxDone = false;
    draggable.snap = snap;
    expect(window.initBBoxDone).toBe(true);
    expect(props.parsedSnapTargets).toEqual({
      x: [
        {value: snap.x.points[0].value, gravity: SNAP_GRAVITY, edge: snap.x.points[0].edge},
        {value: 0.16, isRatio: true, gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: snap.x.base},
        {value: parent, isElement: true, gravity: SNAP_GRAVITY, edge: SNAP_EDGE, side: snap.side},
        {value: parent, isElement: true, gravity: SNAP_GRAVITY, edge: SNAP_EDGE, side: snap.x.points[3].side}
      ],
      y: [
        {value: snap.y.points[0].value, gravity: snap.y.points[0].gravity, edge: snap.y.edge},
        {value: 0.16, isRatio: true, gravity: snap.y.gravity, edge: snap.y.edge, base: SNAP_BASE},
        {value: parent, isElement: true, gravity: snap.y.gravity, edge: snap.y.edge, side: snap.side},
        {value: parent, isElement: true, gravity: snap.y.gravity, edge: snap.y.edge, side: snap.y.points[3].side}
      ]
    });
    // Add default to top level
    snap.gravity = SNAP_GRAVITY;
    snap.edge = SNAP_EDGE;
    snap.base = SNAP_BASE;
    expect(draggable.snap).toEqual(snap);

    done();
  });

  it('should not update same `snap`', function(done) {
    // Ignore same parsed options
    draggable.snap = {
      x: 16,
      y: {edge: 'end', points: 32}
    };
    expect(props.parsedSnapTargets).toEqual({
      x: [{value: 16, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}],
      y: [{value: 32, gravity: SNAP_GRAVITY, edge: 'end'}]
    });
    window.initBBoxDone = false;
    draggable.snap = {
      edge: 'end',
      x: {value: 16, edge: SNAP_EDGE},
      y: 32
    };
    expect(window.initBBoxDone).toBe(false);

    // ON -> OFF
    window.initBBoxDone = false;
    draggable.snap = null;
    expect(window.initBBoxDone).toBe(false); // initBBox is not called when OFF
    expect(props.parsedSnapTargets).not.toBeDefined();
    expect(draggable.snap).not.toBeDefined();

    // OFF -> ON
    var share;
    window.initBBoxDone = false;
    draggable.snap = 16;
    expect(window.initBBoxDone).toBe(true);
    share = [{value: 16, gravity: SNAP_GRAVITY, edge: SNAP_EDGE}];
    expect(props.parsedSnapTargets).toEqual({x: share, y: share});
    share = {points: [{value: 16}]};
    expect(draggable.snap).toEqual({x: share, y: share,
      gravity: SNAP_GRAVITY, edge: SNAP_EDGE, base: SNAP_BASE, side: SNAP_SIDE});

    done();
  });

});
