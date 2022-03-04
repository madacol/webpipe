export function getNodeFromSelector(cssSelector) {
    const nodes = document.querySelectorAll(cssSelector)
    if (nodes.length > 1) console.warn(`Multiple nodes found for selector "${cssSelector}". Choosing first one`, nodes);
    return nodes[0]
}

export async function sendToActiveTab(payload) {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    browser.tabs.sendMessage(tabs[0].id, payload)
}

export async function sendAttachSignal(observer) {
    await sendToActiveTab({
        action: "attachMode",
        observer
    })
}