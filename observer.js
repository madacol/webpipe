const observers = []
function removeObserver(observer, idx) {
    observer.disconnect()
    observers.splice(idx, 1) // remove observer
}
function observeNode(node) {
    const idx = observers.push(null) - 1
    const payload = {
        action: "create",
        idx,
        textContent: node.textContent
    }
    browser.runtime.sendMessage(payload, response =>{
        if (response) {
            // Failed
            observer.disconnect()
            observers.splice(idx, 1) // remove observer
            return
        }
        // Success
        const observer = new MutationObserver(function (mutationsList, observer) {
            const payload = {
                action: "update",
                idx,
                textContent: node.textContent
            }
            browser.runtime.sendMessage(payload, response =>{
                if (!response) return // Success
                // Failed
                removeObserver(observer, idx)
            })
        })
        observer.observe(node, { childList: true, subtree: true, characterData: true })
        observers[idx] = {observer, node}
    })
}


export default async function observe() {
    (await import(browser.runtime.getURL("element-picker.js"))) // Injects `elementPicker` into `window`
    window.elementPicker.init({onClick: observeNode, backgroundColor: "#00bbff69"})
}