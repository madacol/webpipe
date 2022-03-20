import getCssSelector from "css-selector-generator";
import ObserverPreview from "./ObserverPreview.svelte";

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

    /**
     * Mount ObserverPreview
     */
    document.getElementById("observer-preview")?.remove()
    const observerPreviewContainer = document.createElement("div")
    observerPreviewContainer.id = "observer-preview"
    document.body.appendChild(observerPreviewContainer)
    const observerPreview = new ObserverPreview({
      target: observerPreviewContainer,
    });

    let stylesheet = document.getElementById("element-picker")
    if (!stylesheet) {
        stylesheet = document.createElement('style')
        stylesheet.id = "element-picker"
        stylesheet.innerText = `
            .element-picking {
                background-color: ${backgroundColor} !important;
                outline: 3px dashed ${backgroundColor}; !important;
            }`
        document.head.appendChild(stylesheet)
    }

    return pickingPromise = new Promise( (resolve, reject) => {
        /** @type {HTMLElement} */
        let oldTarget;
        elementPickerConstroller = new AbortController()

        function reset(reason) {
            if (reason!=="success") {
                reject("element-picker: " + reason)
            }
            if (reason!=="aborted") {
                signal.onabort = null
                elementPickerConstroller.abort(reason)
            }
            oldTarget.classList.remove("element-picking")
            observerPreview.$set({hoveringNode: null})
            stylesheet.remove()
            observerPreviewContainer.remove()
        }
        const signal = elementPickerConstroller.signal
        signal.onabort = ()=>reset("aborted")

        // return target node
        document.addEventListener('click', (event)=>{
            if (observerPreviewContainer.contains(event.target)) return
            event.preventDefault();
            event.stopPropagation();
            reset("success")
            resolve(event.target)
        }, {capture: true, signal});

        // set backgroundColor to element directly above pointer
        document.addEventListener('mouseover', ({target})=>{
            if (observerPreviewContainer.contains(target)) return
            oldTarget = target;
            observerPreview.$set({hoveringNode: target, cssSelector: getCssSelector(target)})
            target.classList.add("element-picking")
        }, {capture: true, signal});

        // restore original color (if any)
        document.addEventListener('mouseout', ({relatedTarget})=>{
            if (observerPreviewContainer.contains(relatedTarget)) return
            oldTarget.classList.remove("element-picking")
        }, {capture: true, signal});

        // cancel picking element
        document.addEventListener('keyup', (event)=>{
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                reset("cancelled")
            }
        }, {capture: true, signal});
    })
}
