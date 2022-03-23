<script>
import CheckboxToggle from "./CheckboxToggle.svelte";
import Modal from "./Modal.svelte";
import { anySelectorRegex } from "../utils";

    /**@type {HTMLElement}*/
    export let hoveringNode = null;
    export let isOpen = true;
    export let cssSelector = "";

    let /**@type {string}*/ ancestorsSelector;
    let /**@type {string}*/ nodeSelector;
    $: if (cssSelector) {
        const wholeNodeSelectorRegex = new RegExp(`(?:${anySelectorRegex.source})+`,'g')
        const nodeSelectorMatch = Array.from(cssSelector.matchAll(wholeNodeSelectorRegex)).at(-1)
        console.log(cssSelector, nodeSelectorMatch);
        nodeSelector = nodeSelectorMatch[0]
        ancestorsSelector = cssSelector.slice(0, nodeSelectorMatch.index)
    }
    $: tag = hoveringNode.tagName.toLowerCase()
    let isId = false;
    let isTag = false;
    let selectedClasses=[];
    let selectedAttributes=[];
    let selectedPseudoClasses=[];
    /**
     * Extract individual selectors from `nodeSelector` to populate following states
     * `isId`
     * `isTag`
     * `selectedClasses`
     * `selectedAttributes`
     * `selectedPseudoClasses`
     */
    function parseNodeSelector() {
        isId = false;
        isTag = false;
        selectedClasses=[];
        selectedAttributes=[];
        selectedPseudoClasses=[];
        for (const match of nodeSelector.matchAll(anySelectorRegex)) {
            const selector = match[0]
            switch (selector[0]) {
                case "#": isId = true; break;
                case ".": selectedClasses.push(selector); break;
                case "[": selectedAttributes.push(selector.replaceAll("\\","")); break;
                case ":": selectedPseudoClasses.push(selector); break;
                default:
                    (selector === tag)
                        ? isTag = true
                        : console.error(`selector format unkown: ${selector}`);
                    break;
            }
        }
    }
    $: if (nodeSelector) parseNodeSelector()
    /**
     * The above is a technique to stop svelte invalidating the dependency tree upward
     * https://github.com/sveltejs/svelte/issues/4933#issuecomment-1072607689
     * 
     * You may think you could avoid declaring this function above and have this done using a **reactive statement**
     * But then, when any of the states assigned is modified externally, svelte also marks its dependencies as dirty
     * which then makes this **reactive statement** to be run again, thus losing the modifications made
     */


    /**
     * Below we do the checkbox bind:groups but traversing components
     * https://github.com/sveltejs/svelte/issues/2308#issuecomment-1005942571
     * https://svelte.dev/repl/02d60142a1cc470bb43e0cfddaba4af1?version=3.38.3
     */

    $: id = "#"+hoveringNode.id
    $: idSelector = isId ? id : "";
    $: tagSelector = isTag ? tag : "";
    $: classes = Array.from(hoveringNode.classList || []).filter(x=>x!=="element-picking").map(x=>"."+x)

    // attributes
    $: attributes = Object.values(hoveringNode.attributes || [])
                          .filter(attr=>!["class","style", "id"].includes(attr.name))
                          .map(attr=>`[${attr.name}='${attr.value}']`)

    let pseudoClasses = [];
    $: if (hoveringNode) pseudo: {
        pseudoClasses = [];
        let node = hoveringNode
        if (node.previousElementSibling == null) pseudoClasses.push(":first-child", ":first-of-type")
        if (node.nextElementSibling == null) pseudoClasses.push(":last-child", ":last-of-type")
        if (pseudoClasses.length === 4) {   // is first and last, hence, only child
            pseudoClasses.push(":only-child", ":only-of-type")
            break pseudo;
        }
        let childIndex=1;
        let typeIndex=1;
        while (node=node.previousElementSibling) {
            childIndex++;
            if (node.tagName.toLowerCase() === tag) typeIndex++
        };
        const siblingsCount = hoveringNode.parentElement.childElementCount
        pseudoClasses.push(
            `:nth-child(${childIndex})`,
            `:nth-last-child(${siblingsCount - childIndex + 1})`,
            `:nth-of-type(${typeIndex})`
        )
    }

    /**
     * Below is a technique to stop svelte invalidating the dependency tree upward
     * https://github.com/sveltejs/svelte/issues/4933#issuecomment-1072607689
     * 
     * You may think you could avoid declaring this function and have this done with a simple **reactive declaration**
     * like this `$: constructedNodeSelector = tagSelector + idSelector + selectedClasses.join("") + selectedAttributes.join("") + selectedPseudoClasses.join("")`
     * But then when `constructedNodeSelector` is modified externally, svelte also marks its dependencies as dirty
     * which then makes the above **reactive declaration** to be run again, thus losing the modifications made to `constructedNodeSelector`
     */
    let constructedNodeSelector;
    const getconstructedNodeSelector = ()=> constructedNodeSelector = tagSelector + idSelector + selectedClasses.join("") + selectedAttributes.join("") + selectedPseudoClasses.join("")
    $: tagSelector, idSelector, selectedClasses, selectedAttributes, selectedPseudoClasses, getconstructedNodeSelector()

    $: selector = ancestorsSelector + constructedNodeSelector
    $: {
        document.querySelectorAll(".element-picking").forEach(x=>x.classList.remove("element-picking"))
        try {
            document.querySelectorAll(selector).forEach(x=>x.classList.add("element-picking"))
            document.getElementById("selector-explorer")
                    .querySelectorAll(".element-picking")
                    .forEach(x=>x.classList.remove("element-picking"))
        } catch (error) {console.error(error);}
    }
    $: console.log(selector);

    function updateGroup({ target: { value, checked } }, group) {
        return (checked)
            ? [...group, value]
            : group.filter((item) => item !== value);
    }
</script>

<Modal on:close={()=>{
    isOpen=false
    document.querySelectorAll(".element-picking").forEach(x=>x.classList.remove("element-picking"))
}}>
    <div slot="header">
        <input type="text" bind:value={ancestorsSelector}>
        <input type="text" bind:value={constructedNodeSelector}>
    </div>

    <div class="selector">
        <CheckboxToggle
            label={tag}
            bind:checked={isTag}
        />
        {#if hoveringNode.id}
            <CheckboxToggle
                label={id}
                bind:checked={isId}
            />
        {/if}
        <hr>
        {#each classes as classString }
            <div class="classes">
                <CheckboxToggle
                    label={classString}
                    checked={selectedClasses.includes(classString)}
                    on:change={e=>selectedClasses = updateGroup(e, selectedClasses)}
                />
            </div>
        {/each}
        <hr>
        {#each attributes as selector }
            <div class="attributes">
                <CheckboxToggle
                    label={selector}
                    checked={selectedAttributes.includes(selector)}
                    on:change={e=>selectedAttributes = updateGroup(e, selectedAttributes)}
                />
            </div>
        {/each}
        <hr>
        {#each pseudoClasses as pseudoClass }
            <div class="pseudo-classes">
                <CheckboxToggle
                    label={pseudoClass}
                    checked={selectedPseudoClasses.includes(pseudoClass)}
                    on:change={e=>selectedPseudoClasses = updateGroup(e, selectedPseudoClasses)}
                />
            </div>
        {/each}
    </div>
</Modal>

<style>
    .selector {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3em;
    }
    hr {width: 90%;}
</style>