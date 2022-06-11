import elementPicker from "./element-picker"

/**
 * 
 * @param {string} cssSelector 
 * @returns {Element}
 */
export function getNodeFromSelector(cssSelector) {
    const nodes = document.querySelectorAll(cssSelector)
    if (nodes.length > 1) console.warn(`Multiple nodes found for selector "${cssSelector}". Choosing first one`, nodes);
    return nodes[0]
}

export const observers = []

function observeNode(idx) {

    function sendUpdate(text) {
        const updatePayload = {
            action: "update",
            observer: {
                idx,
                outerText: text
            }
        }
        browser.runtime.sendMessage(updatePayload)
    }

    let oldText
    const intervalId = setInterval(()=>{
        const node = getNodeFromSelector(observers[idx].cssSelector)
        const text = (node.tagName === "INPUT" || node.tagName === "TEXTAREA")
            ? node.value
            : node.outerText

        if (oldText === text) return // no change

        sendUpdate(text)
        oldText = text
    }, 500)
    observers[idx].stop = ()=>clearInterval(intervalId)

    // if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
    //     /**
    //      * There's no clean way to detect an `input.value` change from an extension =/
    //      * https://stackoverflow.com/questions/32383349/detect-input-value-change-with-mutationobserver
    //      * 
    //      * UPDATE: I now think it's possible, we can append a <script> to <head> and it will run in page's context,
    //      * we could define a getter/setter property so when `value` is set it fires a `change` event,
    //      * and now we can listen to that event from this side
    //      */
    //     let oldValue = node.value
    //     const intervalId = setInterval(()=>{
    //         if (oldValue === node.value) return
    //         sendUpdate(node.value)
    //         oldValue = node.value
    //     }, 100)
    //     observers[idx].stop = ()=>clearInterval(intervalId)
    // } else {
    //     const observer = new MutationObserver(()=>sendUpdate(node.outerText))
    //     observer.observe(node, { childList: true, subtree: true, characterData: true })
    //     observers[idx].observer = observer
    //     observers[idx].stop = observer.disconnect
    // }
}

export async function observe() {
    const {node, cssSelector} = await elementPicker("#00bbff70")
    const idx = observers.push({cssSelector}) - 1
    const createPayload = {
        action: "create",
        observer: {
            idx,
            outerText: (node.value || node.outerText),
            cssSelector
        }
    }

    await browser.runtime.sendMessage(createPayload)

    observeNode(idx)
}

export async function restoreObserver(observer) {
    observers[observer.idx] = observer
    observeNode(observer.idx)
}

export function updateSelector({cssSelector, idx}) {
    observers[idx].cssSelector = cssSelector
}

export async function getSelector() {
    const {cssSelector} = await elementPicker("#00bbff70")

    await browser.runtime.sendMessage({
        action: "assignSelector",
        cssSelector
    })
}