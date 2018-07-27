describe('autoScroll', function() {
  'use strict';

  var window, document, pageDone,
    parent, elm1, draggable, props,

    clientWidth, clientHeight,

    AUTOSCROLL_SPEED, AUTOSCROLL_SENSITIVITY,

    // bBox of element and window
    ELM_W = 102,
    ELM_H = 104,
    WIN_L = 0,
    WIN_T = 0,
    WIN_R, WIN_B, WIN_W, WIN_H,

    SCROLL_WIDTH = 640,
    SCROLL_HEIGHT = 960,
    WIN_WIDTH = 300,
    WIN_HEIGHT = 400;

  beforeAll(function(beforeDone) {
    loadPage('spec/common-window.html', function(pageWindow, pageDocument, pageBody, done) {
      var iframe = pageDocument.getElementById('iframe');
      window = iframe.contentWindow;
      document = window.document;
      pageDone = done;

      iframe.style.width = WIN_WIDTH + 'px';
      iframe.style.height = WIN_HEIGHT + 'px';
      iframe.style.border = '0 none';
      document.body.style.margin = '0';

      parent = document.getElementById('parent');
      elm1 = document.getElementById('elm1');

      parent.style.width = SCROLL_WIDTH + 'px';
      parent.style.height = SCROLL_HEIGHT + 'px';
      clientWidth = document.documentElement.clientWidth;
      clientHeight = document.documentElement.clientHeight;
      WIN_W = clientWidth;
      WIN_H = clientHeight;
      WIN_R = WIN_L + WIN_W;
      WIN_B = WIN_T + WIN_H;

      draggable = new window.PlainDraggable(elm1);
      props = window.insProps[draggable._id];

      AUTOSCROLL_SPEED = window.AUTOSCROLL_SPEED;
      AUTOSCROLL_SENSITIVITY = window.AUTOSCROLL_SENSITIVITY;

      beforeDone();
    }, 'autoScroll');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainDraggable.limit).toBe(!!self.top.LIMIT);
  });

  it('Default', function(done) {
    expect(draggable.autoScroll).not.toBeDefined(); // Default
    expect(props.autoScroll == null).toBe(true); // Default

    draggable.autoScroll = true;
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });
    delete props.autoScroll.scrollableBBox; // Ignore
    expect(props.autoScroll).toEqual({
      target: window,
      isWindow: true,
      scrollWidth: SCROLL_WIDTH,
      scrollHeight: SCROLL_HEIGHT,
      x: {
        min: 0,
        max: SCROLL_WIDTH - clientWidth,
        lines: [
          {dir: -1, speed: AUTOSCROLL_SPEED[2], position: WIN_L + AUTOSCROLL_SENSITIVITY[2]},
          {dir: 1, speed: AUTOSCROLL_SPEED[2], position: WIN_R - AUTOSCROLL_SENSITIVITY[2] - ELM_W},
          {dir: -1, speed: AUTOSCROLL_SPEED[1], position: WIN_L + AUTOSCROLL_SENSITIVITY[1]},
          {dir: 1, speed: AUTOSCROLL_SPEED[1], position: WIN_R - AUTOSCROLL_SENSITIVITY[1] - ELM_W},
          {dir: -1, speed: AUTOSCROLL_SPEED[0], position: WIN_L + AUTOSCROLL_SENSITIVITY[0]},
          {dir: 1, speed: AUTOSCROLL_SPEED[0], position: WIN_R - AUTOSCROLL_SENSITIVITY[0] - ELM_W}
        ]
      },
      y: {
        min: 0,
        max: SCROLL_HEIGHT - clientHeight,
        lines: [
          {dir: -1, speed: AUTOSCROLL_SPEED[2], position: WIN_T + AUTOSCROLL_SENSITIVITY[2]},
          {dir: 1, speed: AUTOSCROLL_SPEED[2], position: WIN_B - AUTOSCROLL_SENSITIVITY[2] - ELM_H},
          {dir: -1, speed: AUTOSCROLL_SPEED[1], position: WIN_T + AUTOSCROLL_SENSITIVITY[1]},
          {dir: 1, speed: AUTOSCROLL_SPEED[1], position: WIN_B - AUTOSCROLL_SENSITIVITY[1] - ELM_H},
          {dir: -1, speed: AUTOSCROLL_SPEED[0], position: WIN_T + AUTOSCROLL_SENSITIVITY[0]},
          {dir: 1, speed: AUTOSCROLL_SPEED[0], position: WIN_B - AUTOSCROLL_SENSITIVITY[0] - ELM_H}
        ]
      }
    });

    done();
  });

  it('Change `speed`', function(done) {
    var SPEED = [8, 16],
      SENSITIVITY = [32, 64];

    draggable.autoScroll = {
      speed: SPEED,
      sensitivity: SENSITIVITY
    };
    expect(draggable.autoScroll).toEqual({
      target: window,
      speed: SPEED,
      sensitivity: SENSITIVITY
    });
    delete props.autoScroll.scrollableBBox; // Ignore
    expect(props.autoScroll).toEqual({
      target: window,
      isWindow: true,
      scrollWidth: SCROLL_WIDTH,
      scrollHeight: SCROLL_HEIGHT,
      x: {
        min: 0,
        max: SCROLL_WIDTH - clientWidth,
        lines: [
          {dir: -1, speed: SPEED[1], position: WIN_L + SENSITIVITY[1]},
          {dir: 1, speed: SPEED[1], position: WIN_R - SENSITIVITY[1] - ELM_W},
          {dir: -1, speed: SPEED[0], position: WIN_L + SENSITIVITY[0]},
          {dir: 1, speed: SPEED[0], position: WIN_R - SENSITIVITY[0] - ELM_W}
        ]
      },
      y: {
        min: 0,
        max: SCROLL_HEIGHT - clientHeight,
        lines: [
          {dir: -1, speed: SPEED[1], position: WIN_T + SENSITIVITY[1]},
          {dir: 1, speed: SPEED[1], position: WIN_B - SENSITIVITY[1] - ELM_H},
          {dir: -1, speed: SPEED[0], position: WIN_T + SENSITIVITY[0]},
          {dir: 1, speed: SPEED[0], position: WIN_B - SENSITIVITY[0] - ELM_H}
        ]
      }
    });

    done();
  });

  it('min*, max*', function(done) {
    draggable.autoScroll = {minX: 8, maxX: 16, minY: 32, maxY: 64};
    expect(draggable.autoScroll).toEqual({
      minX: 8, maxX: 16, minY: 32, maxY: 64,
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });
    expect(props.autoScroll.x.min).toBe(8);
    expect(props.autoScroll.x.max).toBe(16);
    expect(props.autoScroll.y.min).toBe(32);
    expect(props.autoScroll.y.max).toBe(64);

    // Fix max*
    draggable.autoScroll = {maxX: 8, maxY: SCROLL_HEIGHT}; // maxY over
    expect(draggable.autoScroll).toEqual({
      maxX: 8, maxY: SCROLL_HEIGHT,
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });
    expect(props.autoScroll.x.min).toBe(0);
    expect(props.autoScroll.x.max).toBe(8);
    expect(props.autoScroll.y.min).toBe(0);
    expect(props.autoScroll.y.max).toBe(SCROLL_HEIGHT - clientHeight); // Fixed

    // Default max* -> max scroll
    draggable.autoScroll = {minX: 8, minY: SCROLL_WIDTH}; // minY over
    expect(draggable.autoScroll).toEqual({
      minX: 8, minY: SCROLL_WIDTH,
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });
    expect(props.autoScroll.x.min).toBe(8);
    expect(props.autoScroll.x.max).toBe(SCROLL_WIDTH - clientWidth);
    expect(props.autoScroll.y).not.toBeDefined(); // removed

    // over max* -> max scroll
    draggable.autoScroll = {minX: 8, minY: SCROLL_WIDTH, maxY: SCROLL_WIDTH + 10}; // minY over
    expect(draggable.autoScroll).toEqual({
      minX: 8, minY: SCROLL_WIDTH, maxY: SCROLL_WIDTH + 10,
      target: window,
      speed: AUTOSCROLL_SPEED,
      sensitivity: AUTOSCROLL_SENSITIVITY
    });
    expect(props.autoScroll.x.min).toBe(8);
    expect(props.autoScroll.x.max).toBe(SCROLL_WIDTH - clientWidth);
    expect(props.autoScroll.y).not.toBeDefined(); // removed

    done();
  });

});
