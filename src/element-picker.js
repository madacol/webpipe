
if (typeof window === 'undefined' || !window.document) {
  console.error('elementPicker requires the window and document.');
}

let oldTarget;
let desiredBackgroundColor = 'rgba(0, 0, 0, 0.1)';
let oldBackgroundColor;
let onClick;

function onMouseMove(event) {

  event      = event || window.event;
  var target = event.target || event.srcElement;
  if (oldTarget) {
    resetOldTargetColor();
  }
  else {
    document.body.style.cursor = 'pointer';
  }
  oldTarget = target;
  oldBackgroundColor = target.style.backgroundColor;
  target.style.backgroundColor = desiredBackgroundColor;

}

function onMouseClick(event) {

  event      = event || window.event;
  var target = event.target || event.srcElement;
  if (event.preventDefault) event.preventDefault();
  if (event.stopPropagation) event.stopPropagation();
  reset();
  onClick(target);
  return false

}

function reset() {

  document.removeEventListener('click', onMouseClick, true);
  document.removeEventListener('mousemove', onMouseMove, true);
  document.body.style.cursor = 'auto';
  if (oldTarget) {
    resetOldTargetColor();
  }
  oldTarget = null;
  oldBackgroundColor = null;

}

function resetOldTargetColor() {
  oldTarget.style.backgroundColor = oldBackgroundColor
}

/**
 * 
 * @param {Function} _onClick handler that will be passed the node that was clicked as first parameter
 * @param {String} backgroundColor css color string
 */
export default function elementPicker(_onClick, backgroundColor = desiredBackgroundColor) {

  if (!_onClick) {
    console.error('onClick needs to be specified.');
    return;
  }
  onClick = _onClick;
  desiredBackgroundColor = backgroundColor
  document.addEventListener('click', onMouseClick, true);
  document.addEventListener('mousemove', onMouseMove, true);

}
