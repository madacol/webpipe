import { sendAttachSignal, sendToTab } from "./utils"

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
 *     url: string,
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
 *     url: string,
 *     cssSelector: string
 *   }]
 * }>} Observers
 * 
 * 
 * @type {Observers}
 */

/**
 * Tries to find an opened tab with the given url,
 * and if it's not found, creates a new tab with the given url
 * it waits for tab to load completely
 * @param {string} url 
 */
async function getTabId(tabId, url) {
    return new Promise(async (resolve, reject) => {

        // Check if tab(id) is still open with the same url
        const tab = await browser.tabs.get(tabId).catch(() => ({}))
        if (tab.url === url) {
            resolve(tab.id)
            return
        }

        // Check if url is open but on a different tab
        const [_, domainWithoutPort] = url.match(/^(.+?:\/\/[^/:]+)(?::\d+)?\//)
        const tabs = await browser.tabs.query({ url: domainWithoutPort+"/*" })
        for (const tab of tabs) {
            if (tab.url === url) {
                resolve(tab.id)
                return
            }
        }

        // Create new tab with the given url
        // timeout to reject if tab does not load
        const timeout = setTimeout(() => reject(new Error(`tab with url "${url}" couldn't be created`)), 60000)
        browser.tabs.create({ url })
        function onCompleted(tab) {
            if (tab.url === url) {
                browser.webNavigation.onCompleted.removeListener(onCompleted)
                resolve(tab.tabId)
                // cancel timeout
                clearTimeout(timeout)
            }
        }
        browser.webNavigation.onCompleted.addListener(onCompleted)
    })
}

// Reattach observers from storage
async function restoreStoredObservers() {
    /** @type {Observers} */
    const observers = await browser.storage.local.get()
    Object.entries(observers).forEach(async ([id, observer]) => {
        const tabId = await getTabId(observer.tab.id, observer.tab.url)
        const payload = {
            action: "restoreObserver",
            cssSelector: observer.cssSelector,
            oldId: id,
        }
        sendToTab(tabId, payload)
    })
}
restoreStoredObservers()

async function restoreObserver(observer, oldId) {
    /** @type {Observer} */
    const oldObserver = (await browser.storage.local.get(oldId))[oldId]
    observer.pipes = oldObserver.pipes

    const id = `${observer.tab.id}_${observer.idx}`
    await browser.storage.local.set({ [id]: observer })
    if (id !== oldId) browser.storage.local.remove(oldId)

    // restore attachers
    const pipes = observer.pipes
    delete observer.pipes
    pipes.forEach(async ({tabId, url, idx, cssSelector}) => {
        const payload = {
            action: "restoreAttach",
            observer,
            oldIdx: idx,
            oldTabId: tabId,
            cssSelector
        }
        const newTabId = await getTabId(tabId, url)
        sendToTab(newTabId, payload)
    })
}

async function restoreAttacher(tabId, url, {attach, observer}) {
    const id = `${observer.tab.id}_${observer.idx}`
    /** @type {Observer} */
    const storedObserver = (await browser.storage.local.get(id))[id]
    for (const pipe of storedObserver.pipes) {
        if (pipe.idx === attach.oldIdx && pipe.tabId === attach.oldTabId) {
            pipe.idx = attach.idx
            pipe.tabId = tabId
            pipe.url = url
            break
        }
    }
    await browser.storage.local.set({ [id]: storedObserver })
}

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

async function attachInput(tabId, url, {attach, observer}) {
    const observerId = `${observer.tab.id}_${observer.idx}`
    const {[observerId]: oldObserver} = await browser.storage.local.get(observerId)
    oldObserver.pipes.push({tabId, url, ...attach})
    await browser.storage.local.set({ [observerId]: oldObserver })
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
        case "restore": {
            const observer = {
                ...payload.observer,
                tab: {
                    id: sender.tab.id,
                    url: sender.tab.url,
                    title: sender.tab.title,
                }
            }
            restoreObserver(observer, payload.oldId)
            break;
        }
        case "assignSelector":
            window.cssSelector = payload.cssSelector
            break;

        /**
         * Input messages
         */
        case "attach":
            attachInput(sender.tab.id, sender.tab.url, payload)
            browser.tabs.onActivated.removeListener(attachingObserver)
            break;
        case "restoreAttach":
            restoreAttacher(sender.tab.id, sender.tab.url, payload)
            browser.tabs.onActivated.removeListener(attachingObserver)
            break;

        default:
            console.warn(`message.action: "${payload.action}" unknown`);
            break;
    }
})