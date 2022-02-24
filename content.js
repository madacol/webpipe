
let observe, attacher

browser.runtime.onMessage.addListener(async payload => {

    switch (payload.action) {

        case "observeMode":
            observe = observe || (await import(browser.runtime.getURL("observer.js"))).default
            observe()
            break;

        case "attachMode":
            attacher = attacher || (await import(browser.runtime.getURL("attacher.js")))
            attacher.attach(payload)
            break;

        case "update":
            attacher = attacher || (await import(browser.runtime.getURL("attacher.js")))
            attacher.update(payload)
            break;


        default:
            console.warn(`tab: message.action: "${payload.action}" unknown`);
            break;
    }
})
window.addEventListener("visibilitychange", event => event.stopImmediatePropagation(), true);
window.addEventListener("webkitvisibilitychange", event => event.stopImmediatePropagation(), true);