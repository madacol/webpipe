const observers = {}

// make a reference in `window` to share with popup
window.observers = observers

import { sendToActiveTab } from "./utils"
function registerObserver(tabId, {idx, textContent}) {
    // Tab's first observer
    if (!observers[tabId]) {
        observers[tabId] = {
            [idx]: {
                textContent,
                pipes: []
            }
        }
        return
    }
    // Tab's succesive new observer
    if (observers[tabId][idx]) return console.error(`observer ${tabId}-${idx} already exist`);

    observers[tabId][idx] = {
        textContent,
        pipes: []
    }
}
function updateObserver(tabId, {idx, textContent}) {
    // Update existing observer
    observers[tabId][idx].textContent = textContent

    //send updates to inputs
    observers[tabId][idx].pipes.forEach(({idx, tabId}) => {
        const payload = {
            action: "update",
            textContent,
            idx
        }
        browser.tabs.sendMessage(tabId, payload)
        browser.runtime.sendMessage(payload)
    });
}

function attachInput(tabId, {idx, observer: observerData}) {
    const observer = observers[observerData.tabId][observerData.idx]
    observer.pipes.push({idx, tabId})
}

// function getPipeList(tabId, {inputData, observerData}) {
// }
function sendAttachSignal(observer) {
    sendToActiveTab({
        action: "attachMode",
        observers,
        observer
    })
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
        case "create":
            registerObserver(sender.tab.id, payload)
            const observer = {
                idx: payload.idx,
                textContent: payload.textContent,
                tabId: sender.tab.id
            }
            attachingObserver = () => sendAttachSignal(observer)
            browser.tabs.onActivated.addListener(attachingObserver)
            break;
        case "update":
            updateObserver(sender.tab.id, payload)
            break;

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