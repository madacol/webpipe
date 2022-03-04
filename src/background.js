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
const observers = {}

// make a reference in `window` to share with popup
window.observers = observers

import { sendToActiveTab } from "./utils"
function registerObserver(observer) {
    const id = `${observer.tab.id}_${observer.idx}`

    if (observers[id]) return console.error(`observer ${id} already exist`);

    observers[id] = {
        ...observer,
        pipes: []
    }
}
function updateObserver(observer) {
    const id = `${observer.tab.id}_${observer.idx}`

    // Update existing observer
    observers[id].textContent = observer.textContent

    //send updates to inputs
    observers[id].pipes.forEach(({idx, tabId}) => {
        const payload = {
            action: "update",
            textContent: observer.textContent,
            idx
        }
        browser.tabs.sendMessage(tabId, payload)
    });
    // send update signal to popup
    browser.runtime.sendMessage(payload)

}

// function getPipeList(tabId, {inputData, observerData}) {
// }
function attachInput(tabId, {attach, observer}) {
    const id = `${observer.tab.id}_${observer.idx}`
    observers[id].pipes.push({tabId, ...attach})
}

let attachingObserver

/**
 * Button Action
 */
browser.browserAction.onClicked.addListener(async ()=>{
    sendToActiveTab({action: "observeMode"})
});

browser.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
    if (!sender.tab) {    // Check if a tab is the one sending a message and not the extension
        console.warn("ignored", payload, sender)
        return sendResponse(null) // failed
    }
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
                }
            }
            registerObserver(observer)
            attachingObserver = () => sendAttachSignal(observer)
            browser.tabs.onActivated.addListener(attachingObserver)
            attachingObserver()
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
        }
        /**
         * Input messages
         */
        case "attach":
            attachInput(sender.tab.id, payload)
            browser.tabs.onActivated.removeListener(attachingObserver)
            break;
        // case "request_pipe_list":
        //     sendResponse(getPipeList())
        //     break;

        default:
            console.warn(`message.action: "${payload.action}" unknown`);
            break;
    }
})