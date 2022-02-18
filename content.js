
let observe, attach

browser.runtime.onMessage.addListener(async payload => {

    switch (payload.action) {

        case "observeMode":
            observe = observe || (await import(browser.runtime.getURL("observer.js"))).default
            observe()
            break;

        case "attachMode":
            // attach = attach || (await import(browser.runtime.getURL("attach.js"))).default
            // attach()
            break;


        default:
            console.warn(`tab: message.action: "${payload.action}" unknown`);
            break;
    }
})