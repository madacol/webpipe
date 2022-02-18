const observers = {}
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
    if (!observers[tabId][idx]) {
        observers[tabId][idx] = {
            textContent,
            pipes: []
        }
        return
    }
}
function updateObserver(tabId, {idx, textContent}) {
    // Update existing observer
    observers[tabId][idx].textContent = textContent

    //TODO: send updates to inputs
    
    console.log(observers[tabId][idx]);
}
async function sendPayloadToActiveTab(payload) {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    browser.tabs.sendMessage(tabs[0].id, payload)
}
function sendAttachSignal() {
    sendPayloadToActiveTab({action: "attachMode"})
}

// function attachInput(TabId, {inputData, observerData}) {
//     const observer = observers[observerData.tabId][observerData.idx]
//     observer.pipes.push({...inputData, TabId})
// }

// function getPipeList(TabId, {inputData, observerData}) {
// }

/**
 * Button Action
 */
browser.browserAction.onClicked.addListener(async ()=>{
    sendPayloadToActiveTab({action: "observeMode"})
});

browser.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
    if (!sender.tab) {    // Check if a tab is the one sending a message and not the extension
        return sendResponse(null) // failed
    }
    switch (payload.action) {
        /**
         * Observe messages
         */
        case "create":
            registerObserver(sender.tab.id, payload)
            browser.browserAction.onActivated.addListener(sendAttachSignal)
            break;
        case "update":
            updateObserver(sender.tab.id, payload)
            break;
        
        /**
         * Input messages
         */
        case "attach":
            attachInput(sender.tab.id, payload)
            break;
        case "request_pipe_list":
            sendResponse(getPipeList())
            break;

    
        default:
            console.warn(`message.action: "${payload.action}" unknown`);
            break;
    }
})