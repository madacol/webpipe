/** @type {Promise<Node>} */
export let pickingPromise;
export let elementPickerConstroller;

/**
 * Allows to pick an element in the visible DOM and returns it
 * 
 * @param {String} backgroundColor css color string
 * @returns {Promise<Node>} element picked
 */
export default function elementPicker(backgroundColor = 'rgba(0, 0, 0, 0.1)') {
    elementPickerConstroller?.abort();
    return pickingPromise = new Promise( (resolve, reject) => {
        let oldBackgroundColor;
        let oldTarget;
        elementPickerConstroller = new AbortController()

        function reset(reason) {
            elementPickerConstroller.abort(reason)
            document.body.style.cursor = 'auto';
            oldTarget.style.backgroundColor = oldBackgroundColor
        }

        const signal = elementPickerConstroller.signal

        // return target node
        document.addEventListener('click', (event)=>{
            event.preventDefault();
            event.stopPropagation();
            reset("element picked")
            resolve(event.target)
        }, {capture: true, signal});

        // set backgroundColor to element directly above pointer
        document.addEventListener('mouseover', ({target})=>{
            oldTarget = target;
            oldBackgroundColor = target.style.backgroundColor;
            target.style.backgroundColor = backgroundColor;
        }, {capture: true, signal});

        // restore original color (if any)
        document.addEventListener('mouseout', ({target})=>{
            target.style.backgroundColor = oldBackgroundColor
        }, {capture: true, signal});

        // cancel picking element
        document.addEventListener('keyup', (event)=>{
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                reset("cancelled")
                reject("picking element cancelled")
            }
        }, {capture: true, signal});
    })
}
