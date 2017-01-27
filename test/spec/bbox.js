
describe('BBox', function() {
  'use strict';

  var window, document, pageDone;

  function bBox2Obj(bBox) {
    return ['left', 'top', 'width', 'height', 'right', 'bottom'].reduce(function(obj, prop) {
      obj[prop] = bBox[prop];
      return obj;
    }, {});
  }

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

  it('keeps original bbox if possible', function() {
    var draggable, element, orgBBox, curBBox;

    element = document.getElementById('elm1');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 0, width: 300, height: 20, right: 300, bottom: 20});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: 0});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('0px');

    element = document.getElementById('elm2');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 30, width: 300, height: 26, right: 300, bottom: 56});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: 0});
    expect(element.style.width).toBe('294px');
    expect(element.style.height).toBe('');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('30px');

    element = document.getElementById('elm3');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 60, width: 300, height: 26, right: 300, bottom: 86});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: 0});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('60px');

    element = document.getElementById('elm4');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 120, width: 300, height: 30, right: 300, bottom: 150});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: 0});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('30px');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('120px');

    element = document.getElementById('elm5');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 170, width: 306, height: 36, right: 306, bottom: 206});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: 0});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('30px');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('170px');

    element = document.getElementById('elm6');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 220, width: 300, height: 30, right: 300, bottom: 250});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: 0});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('30px');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('220px');

    element = document.getElementById('elm7');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 90, width: 300, height: 40, right: 300, bottom: 130});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: 0});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('90px');

    element = document.getElementById('elm8');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 0, top: 270, width: 300, height: 30, right: 300, bottom: 300});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: -270});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('30px');
    expect(element.style.left).toBe('0px');
    expect(element.style.top).toBe('0px');

    element = document.getElementById('elm9');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 21, top: 341, width: 300, height: 30, right: 321, bottom: 371});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    // containment height: 50px -> maxTop: 20
    expect(curBBox).toEqual({left: 21, top: 340, width: 300, height: 30, right: 321, bottom: 370});
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: -320});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('30px');
    expect(element.style.left).toBe('21px');
    expect(element.style.top).toBe('20px'); // not `21px` because maxTop is 20

    element = document.getElementById('elm10');
    orgBBox = bBox2Obj(element.getBoundingClientRect());
    expect(orgBBox).toEqual({left: 22, top: 392, width: 300, height: 30, right: 322, bottom: 422});
    draggable = new window.PlainDraggable(element);
    curBBox = bBox2Obj(element.getBoundingClientRect());
    expect(curBBox).toEqual(orgBBox);
    expect(window.insProps[draggable._id].offset).toEqual({left: 0, top: -370});
    expect(element.style.width).toBe('300px');
    expect(element.style.height).toBe('30px');
    expect(element.style.left).toBe('22px');
    expect(element.style.top).toBe('22px');
  });

});
