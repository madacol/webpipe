const elementsAttached = []

export async function attach({observer}) {
    function attachPipe(node) {
        node.value = observer.textContent
        const idx = elementsAttached.push(node) - 1
        const payload = {
            action: "attach",
            idx,
            observer
        }
        browser.runtime.sendMessage(payload)
    }
    (await import(browser.runtime.getURL("element-picker.js"))) // Injects `elementPicker` into `window`
    window.elementPicker.init({onClick: attachPipe, backgroundColor: "#ffbb0070"})
}


export async function update({textContent, idx}) {
    const node = elementsAttached[idx]
    node.value = textContent
}