/*
  Emulate `user-scalable=no` that is ignored by desktop browsers.
  NOTE: This is imperfect because it can't hook UA commands (e.g. menu items).
*/

window.addEventListener('keydown', (event) => {
  if (event.isComposing || event.keyCode === 229) { return; }
  if ((event.key === '+' || event.key === '-') && event.ctrlKey) {
    event.preventDefault();
    event.stopPropagation();
  }
});

window.addEventListener('wheel', (event) => {
  if (event.ctrlKey) {
    event.preventDefault();
    event.stopPropagation();
  }
}, { passive: false });
