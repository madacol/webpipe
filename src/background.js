import { sendAttachSignal } from "./utils"

/**
 * Possible attributes of an observer
 * @typedef {{
 *   idx: number,
 *   textContent: string,
 *   cssSelector: string,
 *   tab: {
 *     id: number,
 *     url: string,
 *     title: string
 *   },
 *   pipes: [{
 *     idx: number,
 *     tabId: number,
 *     cssSelector: string
 *   }]
 * }} Observer
 * 
 * 
 * @typedef {Object.<string, {
 *   idx: number,
 *   textContent: string,
 *   cssSelector: string,
 *   tab: {
 *     id: number,
 *     url: string,
 *     title: string
 *   },
 *   pipes: [{
 *     idx: number,
 *     tabId: number,
 *     cssSelector: string
 *   }]
 * }>} Observers
 * 
 * 
 * @type {Observers}
 * */


async function registerObserver(observer) {
    const id = `${observer.tab.id}_${observer.idx}`

    if ((await browser.storage.local.get(id))[id] !== undefined) return console.error(`observer ${id} already exist`);

    await browser.storage.local.set({ [id]: observer })
}

async function updateObserver(observer) {
    const id = `${observer.tab.id}_${observer.idx}`

    // Update existing observer
    const oldObserver = (await browser.storage.local.get(id))[id]

    //send updates to inputs
    oldObserver.pipes.forEach(({idx, tabId}) => {
        const payload = {
            action: "update",
            textContent: observer.textContent,
            idx
        }
        browser.tabs.sendMessage(tabId, payload)
    });
    await browser.storage.local.set({ [id]: { ...oldObserver, ...observer } })
}

async function attachInput(tabId, {attach, observer}) {
    const id = `${observer.tab.id}_${observer.idx}`
    const {[id]: oldObserver} = await browser.storage.local.get(id)
    oldObserver.pipes.push({tabId, ...attach})
    await browser.storage.local.set({ [id]: oldObserver })
}

let attachingObserver

browser.runtime.onMessage.addListener(function (payload, sender) {
    switch (payload.action) {
        /**
         * Observe messages
         */
        case "create": {
            const observer = {
                ...payload.observer,
                tab: {
                    id: sender.tab.id,
                    url: sender.tab.url,
                    title: sender.tab.title,
                },
                pipes: []
            }
            registerObserver(observer)
            attachingObserver = () => sendAttachSignal(observer)
            browser.tabs.onActivated.addListener(attachingObserver)
            attachingObserver()
            break;
        }
        case "update": {
            const observer = {
                ...payload.observer,
                tab: {
                    id: sender.tab.id,
                    url: sender.tab.url,
                    title: sender.tab.title,
                }
            }
            updateObserver(observer)
            break;
        }
        case "assignSelector":
            window.cssSelector = payload.cssSelector
            break;

        /**
         * Input messages
         */
        case "attach":
            attachInput(sender.tab.id, payload)
            browser.tabs.onActivated.removeListener(attachingObserver)
            break;

        default:
            console.warn(`message.action: "${payload.action}" unknown`);
            break;
    }
})