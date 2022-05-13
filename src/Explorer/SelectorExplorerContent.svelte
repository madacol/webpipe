<script>
import CheckboxToggle from "./CheckboxToggle.svelte";
import Modal from "./Modal.svelte";
import { anySelectorRegex } from "../utils";
import InspectorElement from "./InspectorElement.svelte";
import getCssSelector from "css-selector-generator";
import { createEventDispatcher } from "svelte";

    /**@type {HTMLElement}*/
    export let hoveringNode;
    export let isOpen = true;

    let commitedSelector = "";
    let nodeSelector = "";
    let hasCommited = false;
    $: {
        const cssSelector = getCssSelector(hoveringNode, {
            blacklist: [".element-picking"],
            maxCombinations: 100,
            root: document.querySelector(hasCommited ? commitedSelector : "body"),
        })
        if (hasCommited) {
            nodeSelector = cssSelector;
            break $;
        }
        const wholeNodeSelectorRegex = new RegExp(`(?:${anySelectorRegex.source})+`,'g')
        const nodeSelectorMatch = Array.from(cssSelector.matchAll(wholeNodeSelectorRegex)).at(-1)
        nodeSelector = nodeSelectorMatch[0]
        commitedSelector = cssSelector.slice(0, nodeSelectorMatch.index)
    }
    const dispatch = createEventDispatcher()


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


    $: id = "#"+hoveringNode.id
    $: idSelector = isId ? id : "";
    $: tagSelector = isTag ? tag : "";
    $: classes = Array.from(hoveringNode.classList).filter(x=>x!=="element-picking").map(x=>"."+x)

    // attributes
    $: attributes = Object.values(hoveringNode.attributes)
                          .filter(attr=>![ "class", "id"].includes(attr.name))
                          .map(attr=>`[${attr.name}='${attr.value}']`)

    let pseudoClasses = [];
    $: if (hoveringNode) {
        pseudoClasses = [];
        let node = hoveringNode
        if (!node.previousElementSibling) pseudoClasses.push(":first-child", ":first-of-type")
        if (!node.nextElementSibling) pseudoClasses.push(":last-child", ":last-of-type")
        else {
            // checking if it is `:last-of-type`
            let _node = hoveringNode;
            let isLastOfType = true;
            while (_node=_node.nextElementSibling) { // while nextElementSibling exist
                if (_node.tagName.toLowerCase() === tag) {
                    isLastOfType = false
                    break;
                }
            };
            if (isLastOfType) pseudoClasses.push(":last-of-type")
        }
        if (node.previousElementSibling == null && node.nextElementSibling == null) {
            pseudoClasses.push(":only-child", ":only-of-type")
            break $;
        }

        // getting index for nth-... selectors
        let childIndex=1;
        let typeIndex=1;
        while (node=node.previousElementSibling) { // while previousElementSibling exist
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

    $: selector = commitedSelector + " " + constructedNodeSelector
    $: {
        document.querySelectorAll(".element-picking").forEach(x=>x.classList.remove("element-picking"))
        try {
            document.querySelectorAll(selector).forEach(x=>x.classList.add("element-picking"))
            document.getElementById("selector-explorer")
                    .querySelectorAll(".element-picking")
                    .forEach(x=>x.classList.remove("element-picking"))
        } catch (error) {console.error(error);}
    }

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
    <span slot="header">Selector Explorer</span>
    <div class="content-webpipe">
        <div class="selector-webpipe">
            <input type="text" bind:value={commitedSelector}>
            <button on:click={()=>{
                hasCommited = true;
                commitedSelector += " " + constructedNodeSelector;
            }}>{"<-persist"}</button>
            <input type="text" bind:value={constructedNodeSelector}>
            <button on:click={()=>dispatch("pick", selector)}>pick</button>
        </div>
        <hr>
        <div class="modifiers-webpipe">
            <section class="inspector-tree-webpipe">
                <InspectorElement bind:hoveringNode element={hoveringNode.parentElement?.parentElement}/>
                <InspectorElement bind:hoveringNode element={hoveringNode.parentElement}/>
                <InspectorElement bind:hoveringNode element={hoveringNode}/>
                {#each hoveringNode.children as child}
                    <InspectorElement bind:hoveringNode element={child}/>
                {/each}
            </section>
            <section class="selector-tweaker-webpipe">
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
                <div class="classes-webpipe">
                    {#each classes as classString }
                        <CheckboxToggle
                            label={classString}
                            checked={selectedClasses.includes(classString)}
                            on:change={e=>selectedClasses = updateGroup(e, selectedClasses)}
                        />
                    {/each}
                </div>
                <hr>
                <div class="attributes-webpipe">
                    {#each attributes as selector }
                        <CheckboxToggle
                            label={selector}
                            checked={selectedAttributes.includes(selector)}
                            on:change={e=>selectedAttributes = updateGroup(e, selectedAttributes)}
                        />
                    {/each}
                </div>
                <hr>
                <div class="pseudo-classes-webpipe">
                    {#each pseudoClasses as pseudoClass }
                        <CheckboxToggle
                            label={pseudoClass}
                            checked={selectedPseudoClasses.includes(pseudoClass)}
                            on:change={e=>selectedPseudoClasses = updateGroup(e, selectedPseudoClasses)}
                        />
                    {/each}
                </div>
            </section>
        </div>
    </div>
</Modal>

<style>
    .content-webpipe {
        display: flex;
        flex-direction: column;
        overflow: auto;
    }
    .selector-webpipe {
        display: flex;
        gap: 1em;
    }
    .modifiers-webpipe {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 2em;
        overflow: auto;
    }
    .selector-tweaker-webpipe {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3em;
        overflow: clip auto;
    }
    hr {width: 90%;}
    .inspector-tree-webpipe {
        display: flex;
        flex-direction: column;
        background-color: rgb(36, 36, 36);
        padding: 0 1em;
        overflow: auto;
    }
    button {
        color: black;
        background-color: white;
    }
    .classes-webpipe, .attributes-webpipe, .pseudo-classes-webpipe {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 0.3em;
        width: 100%;
    }
</style>