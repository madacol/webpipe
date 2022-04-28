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

/** @type {{number: Promise<number>}} */
const tabsRestoredPromise = {}
/**
 * Tries to find an opened tab with the given url,
 * and if it's not found, creates a new tab with the given url
 * it waits for tab to load completely
 * @param {number} tabId
 * @param {string} url
 */
async function getTabId(tabId, url) {
    // if tab has been restored before, return its id
    if (tabsRestoredPromise[tabId] !== undefined) {
        console.log(`tab ${tabId} is restoring, or was restored`)
        return await tabsRestoredPromise[tabId]
    }

    tabsRestoredPromise[tabId] = new Promise(async (resolve, reject) => {

        // Check if tab(id) is still open with the same url
        const tab = await browser.tabs.get(tabId).catch(() => ({}))
        if (tab.url === url) {
            resolve(tab.id)
            console.log(`tab ${tabId} is still open with the same url`)
            return
        }

        // Check if url is open but on a different tab
        const domainWithoutPort = url.match(/^(.+?:\/\/[^/:]+)(?::\d+)?\//)[1]
        console.log(domainWithoutPort);
        const tabs = await browser.tabs.query({ url: domainWithoutPort+"/*" })
        for (const tab of tabs) {
            if (tab.url === url) {
                resolve(tab.id)
                console.log(`${tabId}'s url "${url}" is open on a different tab ${tab.id}`)
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

    return await tabsRestoredPromise[tabId]
}

// Reattach observers from storage
async function restoreStoredObservers() {
    /** @type {Observers} */
    const observers = await browser.storage.local.get()
    await browser.storage.local.clear()
    for (const id in observers) {
        const observer = observers[id]
        const tabId = await getTabId(observer.tab.id, observer.tab.url)
        const payload = {
            action: "restoreObserver",
            ...observer,
            id,
        }
        sendToTab(tabId, payload)
        for (const pipe of observer.pipes) {
            const payload = {
                action: "restoreAttach",
                observer,
                pipe,
            }
            const newTabId = await getTabId(pipe.tabId, pipe.url)
            pipe.tabId = newTabId
            sendToTab(newTabId, payload)
        }
        observer.tab.id = tabId
        const newId = `${tabId}_${observer.idx}`
        await browser.storage.local.set({ [newId]: observer })
    }
}
restoreStoredObservers()

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

async function updateAttacher(tabId, url) {
    const observers = await browser.storage.local.get()
    for (const id in observers) {
        let willUpdate = false
        const observer = observers[id]
        for (const pipe of observer.pipes) {
            if (pipe.tabId === tabId) {
                pipe.url = url
                willUpdate = true
            }
        }
        if (willUpdate) await browser.storage.local.set({ [id]: observer })
    }
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
            attachInput(sender.tab.id, sender.tab.url, payload)
            browser.tabs.onActivated.removeListener(attachingObserver)
            break;
        case "urlChange":
            updateAttacher(sender.tab.id, sender.tab.url)
            break;

        default:
            console.warn(`message.action: "${payload.action}" unknown`);
            break;
    }
})