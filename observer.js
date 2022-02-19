const observers = []

function observeNode(node) {
    const idx = observers.push({node}) - 1
    const payload = {
        action: "create",
        idx,
        textContent: node.textContent
    }
    browser.runtime.sendMessage(payload, () => {
        const observer = new MutationObserver(function (mutationsList, observer) {
            const payload = {
                action: "update",
                idx,
                textContent: node.textContent
            }
            browser.runtime.sendMessage(payload)
        })
        observer.observe(node, { childList: true, subtree: true, characterData: true })
        observers[idx].observer = observer
    })
}

export default async function observe() {
    (await import(browser.runtime.getURL("element-picker.js"))) // Injects `elementPicker` into `window`
    window.elementPicker.init({onClick: observeNode, backgroundColor: "#00bbff70"})
}