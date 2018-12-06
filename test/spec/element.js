describe('element', function() {
  'use strict';

  var LIMIT = self.top.LIMIT;
  var window, document, pageDone,
    cssPropTransform,

    // use `top` to get native window
    IS_EDGE = '-ms-scroll-limit' in top.document.documentElement.style &&
      '-ms-ime-align' in top.document.documentElement.style && !top.navigator.msPointerEnabled,
    IS_TRIDENT = !IS_EDGE && !!top.document.uniqueID; // Future Edge might support `document.uniqueID`.

  beforeAll(function(beforeDone) {
    loadPage('spec/element.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      pageDone = done;

      cssPropTransform = window.CSSPrefix.getName('transform');

      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!LIMIT + ')', function() {
    expect(!!window.PlainDraggable.limit).toBe(!!LIMIT);
  });

  it('accepts HTMLElement as layer element', function() {
    var draggable = new window.PlainDraggable(document.getElementById('elm1')),
      props = window.insProps[draggable._id];

    expect(props.svgPoint == null).toBe(true);
    expect(props.orgStyle[cssPropTransform] != null).toBe(true);
    expect(props.orgStyle.position == null).toBe(true);
  });

  it('accepts HTMLElement as layer element with option (left and top)', function() {
    var draggable, props;

    if (LIMIT) {
      expect(function() {
        draggable = new window.PlainDraggable(document.getElementById('elm1'), {leftTop: true});
        console.log(draggable); // dummy
      }).toThrowError('`transform` is not supported.');
    } else {
      draggable = new window.PlainDraggable(document.getElementById('elm1'), {leftTop: true});
      props = window.insProps[draggable._id];
      expect(props.svgPoint == null).toBe(true);
      expect(props.orgStyle[cssPropTransform] == null).toBe(true);
      expect(props.orgStyle.position != null).toBe(true);
    }
  });

  it('accepts SVGElement that is root view as layer element', function() {
    var draggable = new window.PlainDraggable(document.getElementById('svg1')),
      props = window.insProps[draggable._id];

    expect(props.svgPoint == null).toBe(true);
    expect(props.orgStyle[cssPropTransform] != null).toBe(true);
    expect(props.orgStyle.position == null).toBe(true);
  });

  it('accepts SVGElement that is not root view as SVG element', function() {
    if (LIMIT) { return; }
    var draggable = new window.PlainDraggable(document.getElementById('rect1')),
      props = window.insProps[draggable._id];

    expect(props.svgPoint != null).toBe(true); // Has SVG info
    expect(props.orgStyle == null).toBe(true);
  });

  if (IS_TRIDENT || IS_EDGE) {
    it('does not accept SVGSVGElement that has no `transform` (Trident and Edge bug)', function() {
      if (LIMIT) { return; }
      expect(function() {
        var draggable = new window.PlainDraggable(document.getElementById('svg2'));
        console.log(draggable); // dummy
      }).toThrowError(window.Error, 'This element is not accepted. (SVGAnimatedTransformList)');
    });
  } else {
    it('accepts SVGElement (nested SVG) that is not root view as SVG element', function() {
      if (LIMIT) { return; }
      var draggable = new window.PlainDraggable(document.getElementById('svg2')),
        props = window.insProps[draggable._id];

      expect(props.svgPoint != null).toBe(true); // Has SVG info
      expect(props.orgStyle == null).toBe(true);
    });
  }

  it('accepts SVGElement (nested rect) that is not root view as SVG element', function() {
    if (LIMIT) { return; }
    var draggable = new window.PlainDraggable(document.getElementById('rect2')),
      props = window.insProps[draggable._id];

    expect(props.svgPoint != null).toBe(true); // Has SVG info
    expect(props.orgStyle == null).toBe(true);
  });

  it('sets shadow to optimize it only when it has no shadow', function() {
    var INIT_SHADOW = '1px', // Keyword from initAnim(), the value might be formatted by browser
      cssPropBoxShadow = window.CSSPrefix.getName('boxShadow'),
      elm = document.getElementById('elm1'),
      draggable = new window.PlainDraggable(elm), // eslint-disable-line no-unused-vars
      cmpValue;

    // elm1 may has been already set by other tests
    expect(elm.style[cssPropBoxShadow].indexOf(INIT_SHADOW)).not.toBe(-1);

    elm = document.getElementById('elm-shadow-by-id');
    cmpValue = window.getComputedStyle(elm, '')[cssPropBoxShadow];
    expect(elm.style[cssPropBoxShadow]).toBe('');
    expect(cmpValue).not.toBe('');
    expect(cmpValue).not.toBe('none');
    expect(cmpValue.indexOf(INIT_SHADOW)).toBe(-1);
    expect(cmpValue.indexOf('5px')).not.toBe(-1);
    draggable = new window.PlainDraggable(elm); // Setup
    // Not changed
    cmpValue = window.getComputedStyle(elm, '')[cssPropBoxShadow];
    expect(elm.style[cssPropBoxShadow]).toBe('');
    expect(cmpValue).not.toBe('');
    expect(cmpValue).not.toBe('none');
    expect(cmpValue.indexOf(INIT_SHADOW)).toBe(-1);
    expect(cmpValue.indexOf('5px')).not.toBe(-1);

    // Has no shadow yet
    elm = document.getElementById('elm-shadow-by-style');
    cmpValue = window.getComputedStyle(elm, '')[cssPropBoxShadow];
    expect(elm.style[cssPropBoxShadow]).toBe('');
    expect(cmpValue).toBe('none');
    draggable = new window.PlainDraggable(elm); // Setup
    // Changed
    expect(elm.style[cssPropBoxShadow].indexOf(INIT_SHADOW)).not.toBe(-1);

    // Set to style
    elm.style[cssPropBoxShadow] = '3px 5px 10px 3px rgba(0, 0, 0, 0.3)';
    cmpValue = window.getComputedStyle(elm, '')[cssPropBoxShadow];
    expect(elm.style[cssPropBoxShadow].indexOf(INIT_SHADOW)).toBe(-1);
    expect(elm.style[cssPropBoxShadow].indexOf('5px')).not.toBe(-1);
    expect(cmpValue.indexOf(INIT_SHADOW)).toBe(-1);
    expect(cmpValue.indexOf('5px')).not.toBe(-1);
    draggable = new window.PlainDraggable(elm); // Setup
    // Not changed
    expect(elm.style[cssPropBoxShadow].indexOf(INIT_SHADOW)).toBe(-1);
    expect(elm.style[cssPropBoxShadow].indexOf('5px')).not.toBe(-1);
    expect(cmpValue.indexOf(INIT_SHADOW)).toBe(-1);
    expect(cmpValue.indexOf('5px')).not.toBe(-1);
  });

});
