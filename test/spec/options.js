
describe('setOptions()', function() {
  'use strict';

  var window, document, body, pageDone,
    parent, elm1, handle, draggable, props;

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

    done();
  });

  it('should not update when same bBox is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {x: 0, y: 0, right: 128, bottom: 64}; // Substitutes props
    expect(window.initBBoxDone).toBe(false);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 0, top: 0, width: 128, height: 64, x: 0, y: 0, right: 128, bottom: 64});

    done();
  });

  it('should update when new bBox is passed for `containment`', function(done) {
    window.initBBoxDone = false;
    draggable.containment = {left: 1, top: 0, width: 128, height: 64};
    expect(window.initBBoxDone).toBe(true);
    expect(props.containmentIsBBox).toBe(true);
    expect(props.containmentBBox)
      .toEqual({left: 1, top: 0, width: 128, height: 64, x: 1, y: 0, right: 129, bottom: 64});

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

});
