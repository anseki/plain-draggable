describe('BBox', function() {
  'use strict';

  var window, document, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/bbox.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      pageDone = done;
      beforeDone();
    }, 'BBox');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainDraggable.limit).toBe(!!self.top.LIMIT);
  });

  it('keeps original BBox if possible', function() {
    var draggable, element, orgBBox, curBBox, saveWidth;

    element = document.getElementById('elm1');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 0, x: 0, y: 0, width: 300, height: 20, right: 300, bottom: 20});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: 0});

    element = document.getElementById('elm2');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 30, x: 0, y: 30, width: 300, height: 26, right: 300, bottom: 56});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: -30});

    element.style.width = '160px'; // border: 1, padding 2 -> BBox.width: 166
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 30, x: 0, y: 30, width: 166, height: 26, right: 166, bottom: 56});
    draggable.position();
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(element.style.width).toBe('160px'); // Don't change

    element = document.getElementById('elm3');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 60, x: 0, y: 60, width: 300, height: 26, right: 300, bottom: 86});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: -60});

    element = document.getElementById('elm4');
    saveWidth = element.style.width;
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 120, x: 0, y: 120, width: 300, height: 30, right: 300, bottom: 150});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: -120});

    // Change size (width was not changed by init)
    expect(element.style.width).toBe(saveWidth);
    element.style.width = '160px';
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 120, x: 0, y: 120, width: 160, height: 30, right: 160, bottom: 150});
    draggable.position();
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(element.style.width).toBe('160px'); // Don't change

    element = document.getElementById('elm5');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 170, x: 0, y: 170, width: 306, height: 36, right: 306, bottom: 206});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: -170});

    element = document.getElementById('elm6');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 220, x: 0, y: 220, width: 300, height: 30, right: 300, bottom: 250});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: -220});

    element = document.getElementById('elm7');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 90, x: 0, y: 90, width: 300, height: 40, right: 300, bottom: 130});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: -90});

    element = document.getElementById('elm8');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 0, top: 270, x: 0, y: 270, width: 300, height: 30, right: 300, bottom: 300});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: -270});

    element = document.getElementById('elm9');
    orgBBox = window.getBBox(element);
    // margin: 21px -> top: 21
    expect(orgBBox).toEqual({left: 22, top: 342, x: 22, y: 342, width: 300, height: 30, right: 322, bottom: 372});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    // containment height: 48px -> maxTop: 18
    expect(curBBox).toEqual({left: 22, top: 339, x: 22, y: 339, width: 300, height: 30, right: 322, bottom: 369});
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: -22, top: -342});

    element = document.getElementById('elm10');
    orgBBox = window.getBBox(element);
    expect(orgBBox).toEqual({left: 22, top: 392, x: 22, y: 392, width: 300, height: 30, right: 322, bottom: 422});
    draggable = new window.PlainDraggable(element);
    curBBox = window.getBBox(element);
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].htmlOffset).toEqual({left: -22, top: -392});
  });

  it('gets offset by document', function() {
    var iWindow = document.getElementById('iframe').contentWindow,
      iDocument = iWindow.document,
      iBody = iDocument.body,
      draggable, element;

    iDocument.getElementById('parent').style.position = 'relative';
    element = iDocument.getElementById('elm1');

    iBody.style.margin = iBody.style.borderWidth = iBody.style.padding = '0';
    draggable = new iWindow.PlainDraggable(element);
    expect(iWindow.insProps[draggable._id].htmlOffset).toEqual({left: 0, top: 0});

    iBody.style.borderStyle = 'solid';
    iBody.style.marginLeft = '1px';
    iBody.style.marginTop = '2px';
    iBody.style.borderLeftWidth = '4px';
    iBody.style.borderTopWidth = '8px';
    iBody.style.paddingLeft = '16px';
    iBody.style.paddingTop = '32px';
    draggable = new iWindow.PlainDraggable(element);
    expect(iWindow.insProps[draggable._id].htmlOffset).toEqual({left: -21, top: -42});
  });

});
