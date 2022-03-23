import getCssSelector from "css-selector-generator";
import SelectorExplorer from "./Explorer/SelectorExplorer.svelte";

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
export default function elementPicker(backgroundColor = 'rgba(0, 255, 255, 0.3)', borderColor = 'rgba(0, 90, 90, 0.3)') {
    elementPickerConstroller?.abort();

    /**
     * Mount SelectorExplorer
     */
    document.getElementById("selector-explorer")?.remove()
    const selectorExplorerContainer = document.createElement("div")
    selectorExplorerContainer.id = "selector-explorer"
    document.body.appendChild(selectorExplorerContainer)
    const selectorExplorer = new SelectorExplorer({
      target: selectorExplorerContainer,
    });

    let stylesheet = document.getElementById("element-picker")
    if (!stylesheet) {
        stylesheet = document.createElement('style')
        stylesheet.id = "element-picker"
        stylesheet.innerText = `
            body, html {
                overflow: initial !important;
            }
            .element-picking {
                background-color: ${backgroundColor} !important;
                outline: 3px dashed ${borderColor}; !important;
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
            selectorExplorer.$set({hoveringNode: null})
            stylesheet.remove()
            selectorExplorerContainer.remove()
        }
        const signal = elementPickerConstroller.signal
        signal.onabort = ()=>reset("aborted")

        // return target node
        document.addEventListener('click', (event)=>{
            if (selectorExplorerContainer.contains(event.target)) return
            event.preventDefault();
            event.stopPropagation();
            reset("success")
            resolve(event.target)
        }, {capture: true, signal});

        // set backgroundColor to element directly above pointer
        document.addEventListener('mouseover', ({target})=>{
            if (selectorExplorerContainer.contains(target)) return
            oldTarget = target;
            selectorExplorer.$set({hoveringNode: target, cssSelector: getCssSelector(target)})
            target.classList.add("element-picking")
        }, {capture: true, signal});

        // restore original color (if any)
        document.addEventListener('mouseout', ({relatedTarget})=>{
            if (selectorExplorerContainer.contains(relatedTarget)) return
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
