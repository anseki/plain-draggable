
describe('functions', function() {
  'use strict';

  var window, document, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/funcs.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      pageDone = done;
      beforeDone();
    }, 'functions');
  });

  afterAll(function() {
    pageDone();
  });

  it('isElement', function() {
    var isElement = window.isElement, element;

    expect(isElement(document.getElementById('elm1'))).toBe(true);

    element = document.createElement('div');
    expect(isElement(element)).toBe(false); // still disconnected
    document.body.appendChild(element);
    expect(isElement(element)).toBe(true);

    element = document.getElementById('rect1');
    expect(Object.prototype.toString.apply(element)).toBe('[object SVGRectElement]');
    expect(isElement(element)).toBe(true); // strict checking is unnecessary.
  });

  it('validBBox', function() {
    var validBBox = window.validBBox;

    expect(validBBox({left: 1, top: 2, width: 4, height: 8}))
      .toEqual({left: 1, top: 2, width: 4, height: 8, x: 1, y: 2, right: 5, bottom: 10});

    expect(validBBox({x: 1, y: 2, width: 4, height: 8})) // x/y
      .toEqual({left: 1, top: 2, width: 4, height: 8, x: 1, y: 2, right: 5, bottom: 10});
    expect(validBBox({x: 1, y: 2, width: 4, height: 8, left: 16, top: 32})) // x/y and left/top
      .toEqual({left: 16, top: 32, width: 4, height: 8, x: 16, y: 32, right: 20, bottom: 40});
    expect(validBBox({top: 2, width: 4, height: 8}) == null).toEqual(true);

    expect(validBBox({left: 1, top: 2, right: 5, bottom: 10})) // right/bottom
      .toEqual({left: 1, top: 2, width: 4, height: 8, x: 1, y: 2, right: 5, bottom: 10});
    expect(validBBox({left: 1, top: 2, right: 5, bottom: 10, width: 16, height: 32})) // right/bottom and width/height
      .toEqual({left: 1, top: 2, width: 16, height: 32, x: 1, y: 2, right: 17, bottom: 34});
    expect(validBBox({left: 1, top: 2, height: 8}) == null).toEqual(true);
    expect(validBBox({left: 1, top: 2, width: 0, height: 8})) // width: 0
      .toEqual({left: 1, top: 2, width: 0, height: 8, x: 1, y: 2, right: 1, bottom: 10});
    expect(validBBox({left: 1, top: 2, right: 0, height: 8}) == null).toEqual(true);
    expect(validBBox({left: 1, top: 2, right: 5, bottom: 1}) == null).toEqual(true);
  });

  it('getBBox', function() {
    var getBBox = window.getBBox, element;

    element = document.getElementById('elm1');
    expect(getBBox(element))
      .toEqual({left: 100, top: 101, width: 104, height: 106, x: 100, y: 101, right: 204, bottom: 207});
    expect(getBBox(element, true))
      .toEqual({left: 101, top: 102, width: 102, height: 104, x: 101, y: 102, right: 203, bottom: 206});

    element = document.getElementById('elm2');
    expect(getBBox(element))
      .toEqual({left: 200, top: 201, width: 222, height: 214, x: 200, y: 201, right: 422, bottom: 415});
    expect(getBBox(element, true))
      .toEqual({left: 216, top: 203, width: 202, height: 204, x: 216, y: 203, right: 418, bottom: 407});
  });

});
