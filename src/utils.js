export async function sendToActiveTab(payload) {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    try {
        await browser.tabs.sendMessage(tabs[0].id, payload)
    } catch (error) {
        await browser.tabs.executeScript(/*tabs[0].id,*/ {
            file: "/content.js",
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