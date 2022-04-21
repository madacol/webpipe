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

export async function update({textContent, idx}) {

    /**
     * If an element is being picked, pause update until picking is finished
     * otherwise update dispatches a click event that will cause the wrong element to be selected
     */
    try {
        await pickingPromise;
    } catch (error) {}

    let node;
    {
        if (!elementsAttached[idx]) return console.error(`Does not exist elementsAttached with idx ${idx}`)

        const {cssSelector, node: savedNode} = elementsAttached[idx]

        // If savedNode is still inserted in the DOM, use it, otherwise find it with the selector
        node = document.contains(savedNode)
            ? savedNode
            : getNodeFromSelector(cssSelector)

        if (!node) return console.error(`Couldn't find node with the selector: ${cssSelector}`)
    }
    node.value = textContent

    /**
     * The following is to make it work for elements used by rich-editors,
     * fancy state frameworks, contenteditable, blah blah
     * 
     * https://github.com/facebook/draft-js/issues/616
     */
    node.click()
    // node.dispatchEvent(new MouseEvent("click"))
    node.dispatchEvent(new KeyboardEvent("keyup"))
    node.dispatchEvent(new KeyboardEvent("keypress"))
    node.dispatchEvent(new KeyboardEvent("keydown"))
    node.dispatchEvent(new InputEvent("input"))
    node.dispatchEvent(new InputEvent("change"))
    node.dispatchEvent(new InputEvent("blur"))
    node.dispatchEvent(new ClipboardEvent(
        "paste",
        {dataType: "text/plain", data: textContent}
    )) // https://github.com/facebook/draft-js/issues/616#issuecomment-426047799

    if (node.isContentEditable) {
        /**
         * First let me send a compassionate message full of love to all poor souls
         * who had no choice but to use the `contenteditable` attribute,
         * and to all those like me who are forced to work with it against our will ='(
         * 
         * Now let's use a deprecated API yaaayyy (this is needed for firefox which probably will affect chrome too)
         * https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
         * TL;DR: THERE ARE NO ALTERNATIVES!
         * 
         * Now pray for my self from the future who will have to deal with duplicated event triggers
         * and draftjs braking apart because its really sensitive.
         * 
         * Really sorry for this rudeness but, Here we go! <3
         */
        selectNodeText(node)
        document.execCommand('insertText', false, textContent)
    }
}

export async function attach({observer}) {
    const {node, cssSelector} = await elementPicker("#ffbb0070")
    const idx = elementsAttached.push({cssSelector, node}) - 1
    const payload = {
        action: "attach",
        observer,
        attach: {
            idx,
            cssSelector
        },
    }
    browser.runtime.sendMessage(payload)
    update({textContent: observer.textContent, idx})
}

export async function restoreAttach({observer, cssSelector, oldIdx, oldTabId}) {
    const node = getNodeFromSelector(cssSelector)
    const idx = elementsAttached.push({cssSelector, node}) - 1
    const payload = {
        action: "restoreAttach",
        observer,
        attach: {
            idx,
            cssSelector,
            oldIdx,
            oldTabId,
        },
    }
    browser.runtime.sendMessage(payload)
    update({textContent: observer.textContent, idx})
}