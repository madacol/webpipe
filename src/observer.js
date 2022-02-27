import elementPicker from "./element-picker"

const observers = []

function observeNode(node) {
    const idx = observers.push({node}) - 1
    const payload = {
        action: "create",
        idx,
        textContent: (node.value || node.textContent)
    }
    function sendUpdate(text) {
        const payload = {
            action: "update",
            idx,
            textContent: text
        }
        browser.runtime.sendMessage(payload)
    }
    if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
        browser.runtime.sendMessage(payload, ()=>{
            /**
             * There's no clean way to detect an `input.value` change from an extension =/
             * https://stackoverflow.com/questions/32383349/detect-input-value-change-with-mutationobserver
             */
            let oldValue = node.value
            setInterval(()=>{
                if (oldValue === node.value) return

                sendUpdate(node.value)
                oldValue = node.value
            }, 100)
        })
    } else {
        browser.runtime.sendMessage(payload, () => {
            const observer = new MutationObserver(()=>sendUpdate(node.textContent))
            observer.observe(node, { childList: true, subtree: true, characterData: true })
            observers[idx].observer = observer
        })
    }
}

export default function observe() {
    elementPicker(observeNode, "#00bbff70")
}