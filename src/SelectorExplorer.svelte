<script>
import { onDestroy } from "svelte";

import CheckboxToggle from "./CheckboxToggle.svelte";

    /**@type {HTMLElement}*/ 
    export let hoveringNode = null;
    /**@type {string}*/ 
    export let cssSelector = "";

    /**
     * get coords of any element relative to the document
     * simplified version of https://stackoverflow.com/a/26230989/3163120
     * @param {HTMLElement} node
     * @returns {{
     *  top: number,
     *  left: number,
     *  bottom: number,
     *  right: number,
     * }}
     */
    function getCoords(node) { // crossbrowser version
        if (!node) return
        const box = node.getBoundingClientRect();
        const top  = box.top  + window.scrollY;
        const left = box.left + window.scrollX;
        const bottom = box.bottom + window.scrollY;
        const right = box.right + window.scrollX;
        return {
            top: Math.round(top),
            left: Math.round(left),
            bottom: Math.round(bottom),
            right: Math.round(right),
        };
    }

    $: nodeCoords = getCoords(hoveringNode)

    // regex to extract selectors
    const tagRegex = /[a-z\-]+/g
    const idRegex = /#[a-zA-Z0-9\-_]+/g
    const classRegex = /\.[a-zA-Z0-9\-_]+/g
    const attrRegex = /\[[a-zA-Z0-9\-_]+(?:='.+?')?\]/g
    const pseudoClassRegex = /\:[a-z\-]+(?:\([^\)]+\))?/g
    const anySelectorRegex = new RegExp(
        `${tagRegex.source}|${idRegex.source}|${classRegex.source}|${attrRegex.source}|${pseudoClassRegex.source}`,
        'g'
    )

    let /**@type {string}*/ ancestorsSelector;
    let /**@type {string}*/ nodeSelector;
    $: if (cssSelector) {
        const wholeNodeSelectorRegex = new RegExp(`(?:${anySelectorRegex.source})+`,'g')
        const nodeSelectorMatch = Array.from(cssSelector.matchAll(wholeNodeSelectorRegex)).at(-1)
        console.log(cssSelector, nodeSelectorMatch);
        nodeSelector = nodeSelectorMatch[0]
        ancestorsSelector = cssSelector.slice(0, nodeSelectorMatch.index)
    }
    $: tag = hoveringNode?.tagName.toLowerCase()
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

    $: id = "#"+hoveringNode?.id
    $: idSelector = isId ? id : "";
    $: tagSelector = isTag ? tag : "";
    $: classes = Array.from(hoveringNode?.classList || []).filter(x=>x!=="element-picking").map(x=>"."+x)

    // attributes
    $: attributes = Object.values(hoveringNode?.attributes || [])
                          .filter(attr=>!["class","style", "id"].includes(attr.name))
                          .map(attr=>`[${attr.name}='${attr.value}']`)

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
        } catch (error) {console.error(error);}
    }
    $: console.log(selector);

    let isOpen = false;
    function openExplorer(e) {
        e.preventDefault();
        e.stopPropagation();
        isOpen=true;
    }
    document.addEventListener("contextmenu", openExplorer, true)
    onDestroy(()=>document.removeEventListener("contextmenu", openExplorer, true))

    function updateGroup({ target }, group) {
        const { value, checked } = target;
        return (checked)
            ? [...group, value]
            : group.filter((item) => item !== value);
    }

    // group.includes(label)
</script>

{#if hoveringNode}
    {#if isOpen}
        <div id="shadow-cancel" style="top: calc({window.scrollY}px - 50vh);" on:click={()=>{
            isOpen=false
            document.querySelectorAll(".element-picking").forEach(x=>x.classList.remove("element-picking"))
        }}/>
    {/if}
    <div id="hoveringNode-position" style="
        left: {nodeCoords.left}px;
        top: {Math.max(nodeCoords.top-14, window.scrollY)}px;
    ">
        {#if isOpen}
            <div id="selector">
                <div>
                    <input type="text" bind:value={ancestorsSelector}>
                    <input type="text" bind:value={constructedNodeSelector}>
                </div>

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
            </div>
        {:else}
            <span id="open-explorer" role="button" on:click={openExplorer}>
                {selector}
            </span>
        {/if}
    </div>
{/if}

<style>
    #hoveringNode-position {
        position: absolute;
        background-color: rgb(44, 44, 44);
        color: white;
        z-index: 999999;
        opacity: 0.85;
        font-size: 14px;
    }
    #selector {
        display: flex;
        flex-direction: column;
    }
    .attributes, .classes {
        display: flex;
    }
    hr {width: 90%;}
    #shadow-cancel {
        background-color: rgba(0, 0, 0, 0.25);
        position: absolute;
        width: 100%;
        height: 200%;
        z-index: 999999;
    }
    #open-explorer {
        max-width: 300px;
        max-height: 2em;
        overflow: auto;
        display: inline-block;
    }
</style>