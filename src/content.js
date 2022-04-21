import { attach, elementsAttached, restoreAttach, update } from "./attacher";
import { elementPickerConstroller } from "./element-picker";
import { getSelector, observe, restoreObserver, observers, updateSelector } from "./observer";

function onMessage (payload) {

    switch (payload.action) {

        case "observeMode":
            observe()
            break;

        case "restoreObserver":
            restoreObserver(payload)
            break;

        case "updateSelector":
            updateSelector(payload)
            break;

        case "getSelector":
            getSelector()
            break;

        case "attachMode":
            attach(payload)
            break;

        case "restoreAttach":
            restoreAttach(payload)
            break;

        case "update":
            update(payload)
            break;

        default:
            console.warn(`tab: unknown message.action: "${payload.action}"`);
            break;
    }

}

function onVisibility(event) {
    event.stopImmediatePropagation()
    if (document.visibilityState === 'hidden') {
        elementPickerConstroller.abort()
        if (elementsAttached.length === 0 && observers.length === 0) {
            browser.runtime.onMessage.removeListener(onMessage)
            window.removeEventListener("visibilitychange", onVisibility, true)
        }
    }
};

export default ()=>{
    browser.runtime.onMessage.addListener(onMessage);
    window.addEventListener("visibilitychange", onVisibility, true);
}