const observers = {}
function updateObserver(tabId, {idx, textContent}) {
    /**
     * Tab's first observer's update
     */
    if (!observers[tabId]) {
        observers[tabId] = {
            [idx]: {
                textContent,
                pipes: []
            }
        }
        return
    }
    /**
     * Tab's succesive new observer's update
     */
    if (!observers[tabId][idx]) {
        observers[tabId][idx] = {
            textContent,
            pipes: []
        }
        return
    }

    /**
     * Update existing observer
     */
    observers[tabId][idx].textContent = textContent
    
    console.log(observers[tabId][idx]);
}

function attachInput(TabId, {inputData, observerData}) {
    const observer = observers[observerData.tabId][observerData.idx]
    observer.pipes.push({...inputData, TabId})
}

function getPipeList(TabId, {inputData, observerData}) {
}

browser.browserAction.onClicked.addListener(tab=>browser.tabs.executeScript(null, {file: `/observer.js`}));

browser.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
    if (!sender.tab)    // Check if a tab is the one sending a message and not the extension
        return sendResponse(null) // failed

    switch (payload.type) {
        /**
         * Observe messages
         */
        case "observe":
            updateObserver(sender.tab.id, payload)
            break;
        
        /**
         * Input messages
         */
        case "pipe":
            attachInput(sender.tab.id, payload)
            break;
        case "request_pipe_list":
            sendResponse(getPipeList())
            break;

    
        default:
            console.warn(`message.type: "${payload.type}" unknown`);
            break;
    }
})