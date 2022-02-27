
let oldTarget;
let backgroundColor = 'rgba(0, 0, 0, 0.1)';
let oldBackgroundColor;
let onClick;

function colorBackground(event) {
    const target = event.target
    oldTarget && (oldTarget.style.backgroundColor = oldBackgroundColor)
    oldTarget = target;
    oldBackgroundColor = target.style.backgroundColor;
    target.style.backgroundColor = backgroundColor;
}

function onMouseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    reset();
    onClick(event.target);
}

function cancel(event) {
    if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        reset()
    }
}

function reset() {
    document.removeEventListener('click', onMouseClick, true);
    document.removeEventListener('mousemove', colorBackground, true);
    document.removeEventListener('keyup', cancel, true);
    document.body.style.cursor = 'auto';
    oldTarget && (oldTarget.style.backgroundColor = oldBackgroundColor)
    oldTarget = null;
    oldBackgroundColor = null;
}
/**
 * 
 * @param {Function} _onClick handler that will be invoked with the node chosen as parameter
 * @param {String} backgroundColor css color string
 */
export default function elementPicker(_onClick, _backgroundColor = backgroundColor) {
    if (!_onClick) {
        console.error('_onClick needs to be specified.');
        return;
    }
    onClick = _onClick
    backgroundColor = _backgroundColor
    document.addEventListener('click', onMouseClick, true);
    document.addEventListener('mousemove', colorBackground, true);
    document.addEventListener('keyup', cancel, true);
}
