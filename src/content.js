import { attach, elementsAttached, update } from "./attacher";
import { elementPickerConstroller } from "./element-picker";
import { getSelector, observe, observers, updateSelector } from "./observer";

browser.runtime.onMessage.addListener( listener = (payload, _s) => {

    switch (payload.action) {

        case "observeMode":
            observe()
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

        case "update":
            update(payload)
            break;

        default:
            console.warn(`tab: unknown message.action: "${payload.action}"`);
            break;
    }
    return true
})
window.addEventListener("visibilitychange", event => {
    event.stopImmediatePropagation()
    if (document.visibilityState === 'hidden') {
        elementPickerConstroller.abort()
        if (elementsAttached.length === 0 && observers.length === 0) browser.runtime.onMessage.removeListener(listener)
    }
}, true);