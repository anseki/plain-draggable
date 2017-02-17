
describe('cursor', function() {
  'use strict';

  var window, document, body, pageDone,
    PlainDraggable,
    defaultDraggableCursor, defaultDraggingCursor,
    draggable = {default: [], byInline: []},
    orgValue = {}, normalValue = {},
    parentCursor = 'wait', classCursor = 'help';

  beforeAll(function(beforeDone) {
    loadPage('spec/cursor.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      body = pageBody;
      pageDone = done;

      PlainDraggable = window.PlainDraggable;
      defaultDraggableCursor = PlainDraggable.draggableCursor;
      defaultDraggingCursor = PlainDraggable.draggingCursor;
      orgValue.body = body.style.cursor;

      var element = document.getElementById('default-0');
      orgValue.default = element.style.cursor;
      draggable.default.push(new PlainDraggable(element));
      draggable.default.push(new PlainDraggable(document.getElementById('default-1')));

      element = document.getElementById('byInline-0');
      orgValue.byInline = element.style.cursor;
      draggable.byInline.push(new PlainDraggable(element));
      draggable.byInline.push(new PlainDraggable(document.getElementById('byInline-1')));

      element = document.getElementById('byParent');
      orgValue.byParent = element.style.cursor;
      draggable.byParent = new PlainDraggable(element);

      element = document.getElementById('byClass');
      orgValue.byClass = element.style.cursor;
      draggable.byClass = new PlainDraggable(element);

      normalValue.draggable = window.CSSPrefix.getValue('cursor', PlainDraggable.draggableCursor);
      normalValue.dragging = window.CSSPrefix.getValue('cursor', PlainDraggable.draggingCursor);

      beforeDone();
    }, 'cursor');
  });

  afterAll(function() {
    pageDone();
  });

  it('is changed by mouse events', function(done) {
    // Check
    expect(normalValue.draggable == null).toBe(false);
    expect(normalValue.draggable).not.toBe(orgValue.default);
    expect(normalValue.draggable).not.toBe(orgValue.byInline);
    expect(normalValue.dragging == null).toBe(false);
    expect(normalValue.dragging).not.toBe(orgValue.default);
    expect(normalValue.dragging).not.toBe(orgValue.byInline);
    expect(normalValue.draggable).not.toBe(normalValue.dragging);

    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);

    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);

    done();
  });

  it('is restored when it is disabled', function(done) {
    draggable.default[1].disabled = draggable.byInline[1].disabled = true;
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);

    done();
  });

  it('is updated in normal state', function(done) {
    draggable.default[1].disabled = draggable.byInline[1].disabled = true;
    PlainDraggable.draggableCursor = 'wait';
    PlainDraggable.draggingCursor = 'help';

    expect(draggable.default[0].element.style.cursor).toBe('wait');
    expect(draggable.byInline[0].element.style.cursor).toBe('wait');
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe('help');
    expect(body.style.cursor).toBe('help');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe('wait');
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe('help');
    expect(body.style.cursor).toBe('help');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe('wait');
    expect(body.style.cursor).toBe(orgValue.body);

    // Disabled
    draggable.default[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe(orgValue.body);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe(orgValue.body);

    // Disabled
    draggable.byInline[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);

    // Enable
    draggable.default[1].disabled = draggable.byInline[1].disabled = false;

    expect(draggable.default[0].element.style.cursor).toBe('wait');
    expect(draggable.byInline[0].element.style.cursor).toBe('wait');
    expect(draggable.default[1].element.style.cursor).toBe('wait');
    expect(draggable.byInline[1].element.style.cursor).toBe('wait');

    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe('help');
    expect(body.style.cursor).toBe('help');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe('wait');
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe('help');
    expect(body.style.cursor).toBe('help');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe('wait');
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.default[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[1].element.style.cursor).toBe('help');
    expect(body.style.cursor).toBe('help');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[1].element.style.cursor).toBe('wait');
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.byInline[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[1].element.style.cursor).toBe('help');
    expect(body.style.cursor).toBe('help');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[1].element.style.cursor).toBe('wait');
    expect(body.style.cursor).toBe(orgValue.body);

    // Reset
    PlainDraggable.draggableCursor = defaultDraggableCursor;
    PlainDraggable.draggingCursor = defaultDraggingCursor;

    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);

    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.default[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.byInline[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);

    done();
  });

  it('is restored when it is disabled in dragging state', function(done) {
    draggable.default[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    draggable.default[1].disabled = true;
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe(orgValue.body);
    // Enable
    draggable.default[1].disabled = false;
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable); // Not dragging
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.byInline[1].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    draggable.byInline[1].disabled = true;
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);
    // Enable
    draggable.byInline[1].disabled = false;
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable); // Not dragging
    expect(body.style.cursor).toBe(orgValue.body);

    done();
  });

  it('is updated in dragging state', function(done) {
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));

    expect(draggable.default[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    PlainDraggable.draggableCursor = 'wait';
    PlainDraggable.draggingCursor = 'help';
    expect(draggable.default[0].element.style.cursor).toBe('help'); // dragging
    expect(body.style.cursor).toBe('help');
    expect(draggable.default[1].element.style.cursor).toBe('wait');
    expect(draggable.byInline[0].element.style.cursor).toBe('wait');
    expect(draggable.byInline[1].element.style.cursor).toBe('wait');

    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe('wait');
    expect(body.style.cursor).toBe(orgValue.body);

    // Disable
    draggable.default[1].disabled = draggable.byInline[1].disabled = true;
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));

    expect(draggable.default[0].element.style.cursor).toBe('help');
    expect(body.style.cursor).toBe('help');
    PlainDraggable.draggableCursor = defaultDraggableCursor;
    PlainDraggable.draggingCursor = defaultDraggingCursor;
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.dragging); // dragging
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);

    draggable.default[1].disabled = draggable.byInline[1].disabled = false;

    done();
  });

  it('can be empty string', function(done) {
    PlainDraggable.draggableCursor = '';

    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');

    PlainDraggable.draggableCursor = defaultDraggableCursor;
    PlainDraggable.draggingCursor = '';

    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe('auto'); // No style
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe('auto'); // No style
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(parentCursor); // Inherited from parent
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(classCursor); // Applied class
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[1].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);

    PlainDraggable.draggableCursor = PlainDraggable.draggingCursor = '';

    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe('auto'); // No style
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe('auto'); // No style
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(parentCursor); // Inherited from parent
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byClass.element.style.cursor).toBe('');

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(classCursor); // Applied class
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe('');
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe('');
    expect(draggable.byInline[0].element.style.cursor).toBe('');
    expect(draggable.default[1].element.style.cursor).toBe('');
    expect(draggable.byInline[1].element.style.cursor).toBe('');
    expect(draggable.byParent.element.style.cursor).toBe('');

    PlainDraggable.draggableCursor = defaultDraggableCursor;
    PlainDraggable.draggingCursor = defaultDraggingCursor;

    done();
  });

  it('is not updated when false is specified', function(done) {
    draggable.default[1].disabled = draggable.byInline[1].disabled = true;
    PlainDraggable.draggingCursor = false;

    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    PlainDraggable.draggableCursor = false;
    PlainDraggable.draggingCursor = defaultDraggingCursor;

    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    PlainDraggable.draggableCursor = PlainDraggable.draggingCursor = false;

    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe('auto'); // No style
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.byInline);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(body.style.cursor).toBe(parentCursor); // Inherited from parent
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(body.style.cursor).toBe(classCursor); // Applied class
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    PlainDraggable.draggableCursor = defaultDraggableCursor;
    PlainDraggable.draggingCursor = defaultDraggingCursor;

    done();
  });

  it('is not updated when specified value is denied', function(done) {
    draggable.default[1].disabled = draggable.byInline[1].disabled = true;
    PlainDraggable.draggingCursor = 'dummy';

    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.draggable);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.draggable);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    PlainDraggable.draggableCursor = 'dummy';
    PlainDraggable.draggingCursor = defaultDraggingCursor;

    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe(normalValue.dragging);
    expect(body.style.cursor).toBe(normalValue.dragging);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    PlainDraggable.draggableCursor = PlainDraggable.draggingCursor = 'dummy';

    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // default
    draggable.default[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe('auto'); // No style
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byInline
    draggable.byInline[0].element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.byInline);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byParent
    draggable.byParent.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(body.style.cursor).toBe(parentCursor); // Inherited from parent
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    // byClass
    draggable.byClass.element.dispatchEvent(new MouseEvent('mousedown'));
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(body.style.cursor).toBe(classCursor); // Applied class
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(draggable.byClass.element.style.cursor).toBe(orgValue.byClass);
    expect(body.style.cursor).toBe(orgValue.body);
    expect(draggable.default[0].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[0].element.style.cursor).toBe(orgValue.byInline);
    expect(draggable.byParent.element.style.cursor).toBe(orgValue.byParent);
    expect(draggable.default[1].element.style.cursor).toBe(orgValue.default);
    expect(draggable.byInline[1].element.style.cursor).toBe(orgValue.byInline);

    PlainDraggable.draggableCursor = defaultDraggableCursor;
    PlainDraggable.draggingCursor = defaultDraggingCursor;

    done();
  });

});
