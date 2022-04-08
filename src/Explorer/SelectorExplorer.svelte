<script>
import { onDestroy } from "svelte";
import getCssSelector from "css-selector-generator";
import SelectorExplorerContent from "./SelectorExplorerContent.svelte";

    /**@type {HTMLElement}*/ 
    export let hoveringNode = null;


    $: nodeCoords = hoveringNode?.getBoundingClientRect();

    let isOpen = false;
    function openExplorer(e) {
        e.preventDefault();
        e.stopPropagation();
        isOpen=true;
    }
    document.addEventListener("contextmenu", openExplorer, true)
    onDestroy(()=>document.removeEventListener("contextmenu", openExplorer, true))

</script>

{#if hoveringNode}
    <div class="selectorExplorer">
        {#if isOpen}
            <SelectorExplorerContent on:pick bind:hoveringNode bind:isOpen />
        {:else}
            <span class="selector-preview" role="button" on:click={openExplorer} style="
                left: {Math.max(nodeCoords.left, 0)}px;
                top: {Math.max(nodeCoords.top, 28)}px;
            ">
                {getCssSelector(hoveringNode, {blacklist: [".element-picking", "[style=*"],maxCombinations: 10})}
            </span>
        {/if}
    </div>
{/if}

<style>
    .selectorExplorer {
        position: absolute;
        z-index: 999999;
        opacity: 0.95;
        font-size: 14px;
        box-sizing: content-box;
    }
    .selector-preview {
        position: fixed;
        max-width: 300px;
        max-height: 2em;
        overflow: auto;
        display: inline-block;
        transform: translate(0,-100%);
        background-color: rgb(44, 44, 44);
        color: white;
    }
</style>