export async function sendToActiveTab(payload) {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    const tabId = tabs[0].id
    await sendToTab(tabId, payload)
}

export async function sendToTab(tabId, payload) {
    try {
        await browser.tabs.sendMessage(tabId, payload)
    } catch (error) {
        await browser.tabs.executeScript(tabId, {
            code: `import(browser.runtime.getURL("./content.js"))
                .then(x=>x.default())`, // this line makes `executeScript(...)` not throw an error https://stackoverflow.com/questions/44567525/inject-scripts-error-script-returned-non-structured-clonable-data-on-firefox-ex/71431342#71431342
                // and now with the addition of `default()` it is also necessary
            allFrames: true
        });
        await browser.tabs.sendMessage(tabId, payload)
    }
}

/**
 * @typedef {import('./background').Observer} Observer
 * 
 * @param {Observer} observer 
 */
export async function sendAttachSignal(observer) {
    await sendToActiveTab({
        action: "attachMode",
        observer
    })
}

// regex to extract selectors
const tagRegex = /[a-z\-]+/.source
const idRegex = /#[a-zA-Z0-9\-_]+/.source
const classRegex = /\.[a-zA-Z0-9\-_]+/.source
const attrRegex = /\[[a-zA-Z0-9\-_]+(?:='.+?')?\]/.source
const pseudoClassRegex = /\:[a-z\-]+(?:\([^\)]+\))?/.source
export const anySelectorRegex = new RegExp(`${tagRegex}|${idRegex}|${classRegex}|${attrRegex}|${pseudoClassRegex}`,'g')
