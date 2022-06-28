import elementPicker, { pickingPromise } from "./element-picker";
import { getNodeFromSelector } from "./observer";

export const elementsAttached = []

function selectNodeText(node) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
}

export async function update({outerText, idx}) {

    /**
     * If an element is being picked, pause update until picking is finished
     * otherwise update dispatches a click event that will cause the wrong element to be selected
     */
    try {
        await pickingPromise;
    } catch (error) {}

    /**
     * Find the correct node to update
     */
    if (!elementsAttached[idx]) return console.error(`Does not exist elementsAttached with idx ${idx}`)

    const {cssSelector} = elementsAttached[idx]
    const node = getNodeFromSelector(cssSelector)

    if (!node) return console.error(`Couldn't find node with the selector: ${cssSelector}`)

    selectNodeText(node)

    if (node.isContentEditable) {
        /**
         * The following is to make it work on rich-editors
         * https://github.com/facebook/draft-js/issues/616
         */

        /**
         * TODO:
         * Most editors support `beforeinput` and `paste` event,
         * but some only support one of these.
         * 
         * And we cannot use both because text gets duplicated
         * on those that support both events
         * 
         * We should try to test one-by-one on setup,
         * and only use the one that works
         * 
         * And/or let the user manually test each event in the explorer
         */

        //  const data = new DataTransfer();
        //  data.setData(
        //      'text/plain',
        //      outerText
        //  );
        //  node.dispatchEvent(new ClipboardEvent("paste", {
        //      dataType: "text/plain",
        //      data: outerText,
        //      bubbles: true,
        //      clipboardData: data,
        //      cancelable: true
        //  }));  // https://github.com/facebook/draft-js/issues/616#issuecomment-426047799

        document.addEventListener("selectionchange",()=>{
            node.dispatchEvent(new InputEvent("beforeinput", {
                inputType: "insertText",
                data: outerText,
                bubbles: true,
                cancelable: true
            }))
        },{once: true})

    } else {

        node.value = outerText

        /**
         * Dispatch events to trigger the change
         */
        node.dispatchEvent(new MouseEvent("mouseover", {bubbles: true}))
        node.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}))
        node.dispatchEvent(new MouseEvent("mouseup", {bubbles: true}))
        node.click()
        node.dispatchEvent(new InputEvent("focus", {bubbles: true}))
        node.dispatchEvent(new KeyboardEvent("keydown", {bubbles: true}))
        node.dispatchEvent(new KeyboardEvent("keyup", {bubbles: true}))
        node.dispatchEvent(new KeyboardEvent("keypress", {bubbles: true}))
        node.dispatchEvent(new InputEvent("beforeinput", {inputType: "insertText", data: outerText, bubbles: true, cancelable: true}))
        node.dispatchEvent(new InputEvent("input", {inputType: "insertText", data: outerText, bubbles: true}))
        node.dispatchEvent(new InputEvent("change", {bubbles: true}))
        node.dispatchEvent(new InputEvent("blur", {bubbles: true}))
    }
}

export async function attach({observer}) {
    const {cssSelector} = await elementPicker("#ffbb0070")
    const idx = elementsAttached.push({cssSelector}) - 1
    const payload = {
        action: "attach",
        observer,
        attach: {
            idx,
            cssSelector
        },
    }
    browser.runtime.sendMessage(payload)
    update({outerText: observer.outerText, idx})
}

export async function restoreAttach({observer, pipe: {cssSelector, idx}}) {
    elementsAttached[idx] = {cssSelector}
    update({
        outerText: observer.outerText,
        idx,
    })
}