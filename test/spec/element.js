
describe('element', function() {
  'use strict';

  var LIMIT = self.top.LIMIT;
  var window, document, pageDone,
    cssPropTransform,
    IS_TRIDENT = !!top.document.uniqueID; // use `top` to get native window

  beforeAll(function(beforeDone) {
    loadPage('spec/element.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      pageDone = done;

      cssPropTransform = window.CSSPrefix.getName('transform');

      beforeDone();
    },'tmp');
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

  if (IS_TRIDENT) {
    it('does not accept SVGSVGElement that has no `transform` (Trident bug)', function() {
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

});
