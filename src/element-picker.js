/**
 * Mount ObserverPreview
 */
import ObserverPreview from "./ObserverPreview.svelte";
const observerPreviewContainer = document.createElement("div")
document.body.appendChild(observerPreviewContainer)
const observerPreview = new ObserverPreview({
  target: observerPreviewContainer,
});

/** @type {Promise<HTMLElement>} */
export let pickingPromise; // allows wait for picking to end
/** @type {AbortController} */
export let elementPickerConstroller = new AbortController(); // allow to cancel picking

/**
 * Allows to pick an element in the visible DOM and returns it
 * 
 * @param {String} backgroundColor css color string
 * @returns {Promise<HTMLElement>} element picked
 */
export default function elementPicker(backgroundColor = 'rgba(0, 0, 0, 0.1)') {
    elementPickerConstroller?.abort();
    return pickingPromise = new Promise( (resolve, reject) => {
        let oldBackgroundColor;
        let oldTarget;
        elementPickerConstroller = new AbortController()

        function reset(reason) {
            if (reason!=="aborted") elementPickerConstroller.abort(reason)
            document.body.style.cursor = 'auto';
            oldTarget.style.backgroundColor = oldBackgroundColor
            observerPreview.$set({hoveringNode: null})
        }

        const signal = elementPickerConstroller.signal
        signal.onabort = ()=>reset("aborted")

        // return target node
        document.addEventListener('click', (event)=>{
            if (observerPreviewContainer.contains(event.target)) return
            event.preventDefault();
            event.stopPropagation();
            reset("element picked")
            resolve(event.target)
        }, {capture: true, signal});

        // set backgroundColor to element directly above pointer
        document.addEventListener('mouseover', ({target})=>{
            if (observerPreviewContainer.contains(target)) return
            oldTarget = target;
            oldBackgroundColor = target.style.backgroundColor;
            target.style.backgroundColor = backgroundColor;
            observerPreview.$set({hoveringNode: target})
        }, {capture: true, signal});

        // restore original color (if any)
        document.addEventListener('mouseout', ({relatedTarget})=>{
            if (observerPreviewContainer.contains(relatedTarget)) return
            oldTarget.style.backgroundColor = oldBackgroundColor
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
