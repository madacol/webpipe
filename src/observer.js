import getCssSelector from "css-selector-generator";
import elementPicker from "./element-picker"

const observers = []

export default async function observe() {
    const node = await elementPicker("#00bbff70")
    const cssSelector = getCssSelector(node)
    const idx = observers.push({cssSelector, node}) - 1
    const createPayload = {
        action: "create",
        observer: {
            idx,
            textContent: (node.value || node.textContent),
            cssSelector
        }
    }
    function sendUpdate(text) {
        const updatePayload = {
            action: "update",
            observer: {
                idx,
                textContent: text,
                cssSelector
            }
        }
        browser.runtime.sendMessage(updatePayload)
    }
    const updateHandler = (node.tagName === "INPUT" || node.tagName === "TEXTAREA") ?
        ()=>{
            /**
             * There's no clean way to detect an `input.value` change from an extension =/
             * https://stackoverflow.com/questions/32383349/detect-input-value-change-with-mutationobserver
             * 
             * UPDATE: I now think it's possible, we can append a <script> to <head> and it will run in page's context,
             * we could define a getter/setter property so when `value` is set it fires a `change` event,
             * and now we can listen to that event from this side
             */
            let oldValue = node.value
            setInterval(()=>{
                if (oldValue === node.value) return

                sendUpdate(node.value)
                oldValue = node.value
            }, 100)
        }
    :
        () => {
            const observer = new MutationObserver(()=>sendUpdate(node.textContent))
            observer.observe(node, { childList: true, subtree: true, characterData: true })
            observers[idx].observer = observer
        }

    browser.runtime.sendMessage(createPayload, updateHandler)
}