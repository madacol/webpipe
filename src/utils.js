export async function sendToActiveTab(payload) {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    try {
        await browser.tabs.sendMessage(tabs[0].id, payload)
    } catch (error) {
        await browser.tabs.executeScript(/*tabs[0].id,*/ {
            code: `import(browser.runtime.getURL("./content.js"))
                .then(x=>null)`, // this line makes `executeScript(...)` not throw an error https://stackoverflow.com/questions/44567525/inject-scripts-error-script-returned-non-structured-clonable-data-on-firefox-ex/71431342#71431342
            allFrames: true
        });
        await browser.tabs.sendMessage(tabs[0].id, payload)
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