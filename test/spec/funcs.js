
describe('functions', function() {
  'use strict';

  var window, document, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/funcs.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      pageDone = done;

      // Export inner functions
      new window.PlainDraggable(pageBody.appendChild(document.createElement('div'))); // eslint-disable-line no-new
      window.validSnapBBox();

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
    expect(validBBox({top: 2, width: 4, height: 8}) == null).toBe(true);

    expect(validBBox({left: 1, top: 2, right: 5, bottom: 10})) // right/bottom
      .toEqual({left: 1, top: 2, width: 4, height: 8, x: 1, y: 2, right: 5, bottom: 10});
    expect(validBBox({left: 1, top: 2, right: 5, bottom: 10, width: 16, height: 32})) // right/bottom and width/height
      .toEqual({left: 1, top: 2, width: 16, height: 32, x: 1, y: 2, right: 17, bottom: 34});
    expect(validBBox({left: 1, top: 2, height: 8}) == null).toBe(true);
    expect(validBBox({left: 1, top: 2, width: 0, height: 8})) // width: 0
      .toEqual({left: 1, top: 2, width: 0, height: 8, x: 1, y: 2, right: 1, bottom: 10});
    expect(validBBox({left: 1, top: 2, right: 0, height: 8}) == null).toBe(true);
    expect(validBBox({left: 1, top: 2, right: 5, bottom: 1}) == null).toBe(true);
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

  it('commonSnapOptions', function() {
    var commonSnapOptions = window.commonSnapOptions;

    // normal
    expect(commonSnapOptions({dummy: 1},
      {gravity: 9, corner: 'tr', side: 'end', edge: 'outside', base: 'document'})
    ).toEqual(
      {gravity: 9, corner: 'tr', side: 'end', edge: 'outside', base: 'document', dummy: 1});

    // gravity
    expect(commonSnapOptions({dummy: 1}, {gravity: '9'})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {gravity: ''})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {gravity: false})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {gravity: 0})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {gravity: -5})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {gravity: 5})).toEqual({gravity: 5, dummy: 1});

    // corner
    expect(commonSnapOptions({dummy: 1}, {corner: 9})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {corner: ''})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {corner: 'dummy'})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {corner: 'all'})).toEqual({corner: 'all', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {corner: '  tl   br   dummy bl '}))
      .toEqual({corner: 'tl br bl', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {corner: 'top-left RIGHT-BOTTOM lb'}))
      .toEqual({corner: 'tl br bl', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {corner: 'top-left tl lt left-top RIGHT-BOTTOM lb'}))
      .toEqual({corner: 'tl br bl', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {corner: 'dummy1 dummy2 dummy3'})).toEqual({dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {corner: 'top-left RIGHT-BOTTOM lb rt'}))
      .toEqual({corner: 'all', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {corner: ' lb lb lb rt lb lb'}))
      .toEqual({corner: 'bl tr', dummy: 1});

    // side
    expect(commonSnapOptions({dummy: 1}, {side: 9})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {side: ''})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {side: 'dummy'})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {side: '  sTart '})).toEqual({side: 'start', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {side: '  eNd '})).toEqual({side: 'end', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {side: 'both'})).toEqual({side: 'both', dummy: 1});

    // edge
    expect(commonSnapOptions({dummy: 1}, {edge: 9})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {edge: ''})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {edge: 'dummy'})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {edge: '  inSide '})).toEqual({edge: 'inside', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {edge: '  oUtside '})).toEqual({edge: 'outside', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {edge: 'both'})).toEqual({edge: 'both', dummy: 1});

    // base
    expect(commonSnapOptions({dummy: 1}, {base: 9})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {base: ''})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {base: 'dummy'})).toEqual({dummy: 1}); // Invalid
    expect(commonSnapOptions({dummy: 1}, {base: '  conTAinment '})).toEqual({base: 'containment', dummy: 1});
    expect(commonSnapOptions({dummy: 1}, {base: '  docUMent '})).toEqual({base: 'document', dummy: 1});
  });

  it('validSnapValue', function() {
    var validSnapValue = window.validSnapValue;

    expect(validSnapValue(1)).toEqual({value: 1, isRatio: false});
    expect(validSnapValue(0)).toEqual({value: 0, isRatio: false});
    expect(validSnapValue(-1)).toEqual({value: -1, isRatio: false});

    // Not number, string
    expect(validSnapValue({}) == null).toBe(true);
    expect(validSnapValue(true) == null).toBe(true);
    expect(validSnapValue() == null).toBe(true);

    // string
    expect(validSnapValue(' 5 ')).toEqual({value: 5, isRatio: false});
    expect(validSnapValue(' 005.00 ')).toEqual({value: 5, isRatio: false});
    expect(validSnapValue(' + 5 ')).toEqual({value: 5, isRatio: false});
    expect(validSnapValue(' - 005.00 ')).toEqual({value: -5, isRatio: false});
    expect(validSnapValue(' - 5 ')).toEqual({value: -5, isRatio: false});
    expect(validSnapValue(' - 005.00 ')).toEqual({value: -5, isRatio: false});

    expect(validSnapValue(' + 5 x ')).toEqual({value: 5, isRatio: false});
    expect(validSnapValue(' - 005.00 x ')).toEqual({value: -5, isRatio: false});
    expect(validSnapValue(' + 5 % ')).toEqual({value: 0.05, isRatio: true});
    expect(validSnapValue(' - 005.00 % ')).toEqual({value: -0.05, isRatio: true});
    expect(validSnapValue(' + 5 x % ')).toEqual({value: 0.05, isRatio: true});
    expect(validSnapValue(' - 005.00 x % ')).toEqual({value: -0.05, isRatio: true});
    expect(validSnapValue(' + 5 % x ')).toEqual({value: 5, isRatio: false}); // `%` is ignored
    expect(validSnapValue(' - 005.00 % x ')).toEqual({value: -5, isRatio: false}); // `%` is ignored
    expect(validSnapValue(' 0% ')).toEqual({value: 0, isRatio: false}); // 0% -> 0

    expect(validSnapValue('') == null).toBe(true);
    expect(validSnapValue(' ') == null).toBe(true);
    expect(validSnapValue('x') == null).toBe(true);
    expect(validSnapValue(' x 5 ') == null).toBe(true);
    expect(validSnapValue(' x 005.00 ') == null).toBe(true);
    expect(validSnapValue(' - x 5 ') == null).toBe(true);
    expect(validSnapValue(' - x 005.00 ') == null).toBe(true);
  });

  it('validSnapBBox', function() {
    var validSnapBBox = window.validSnapBBox,
      share;

    // Not Object
    expect(validSnapBBox(1) == null).toBe(true);
    expect(validSnapBBox('1') == null).toBe(true);
    expect(validSnapBBox(true) == null).toBe(true);
    expect(validSnapBBox() == null).toBe(true);

    share = {
      x: {value: 2, isRatio: false},
      y: {value: 4, isRatio: false},
      left: {value: 2, isRatio: false},
      top: {value: 4, isRatio: false},
      width: {value: 8, isRatio: false},
      height: {value: 16, isRatio: false}
    };
    expect(validSnapBBox({x: 2, y: 4, width: 8, height: 16})).toEqual(share);
    expect(validSnapBBox({x: 2, top: 4, width: 8, height: 16})).toEqual(share); // Alias

    expect(validSnapBBox({x: 2, width: 8, height: 16}) == null).toBe(true); // No y

    expect(validSnapBBox({x: 2, y: 4, width: 0, height: 16})) // width: 0
      .toEqual({
        x: {value: 2, isRatio: false},
        y: {value: 4, isRatio: false},
        left: {value: 2, isRatio: false},
        top: {value: 4, isRatio: false},
        width: {value: 0, isRatio: false},
        height: {value: 16, isRatio: false}
      });
    expect(validSnapBBox({x: 2, y: 4, width: -1, height: 16}) == null).toBe(true); // width: -1
    expect(validSnapBBox({x: 2, y: 4, width: -1, height: 16, right: 32})) // width: -1, right: 32
      .toEqual({
        x: {value: 2, isRatio: false},
        y: {value: 4, isRatio: false},
        left: {value: 2, isRatio: false},
        top: {value: 4, isRatio: false},
        right: {value: 32, isRatio: false},
        height: {value: 16, isRatio: false}
      });

    expect(validSnapBBox({x: 2, y: '4%', width: 8, bottom: ' 16 % '})) // n%
      .toEqual({
        x: {value: 2, isRatio: false},
        y: {value: 0.04, isRatio: true},
        left: {value: 2, isRatio: false},
        top: {value: 0.04, isRatio: true},
        width: {value: 8, isRatio: false},
        bottom: {value: 0.16, isRatio: true}
      });
  });

});
