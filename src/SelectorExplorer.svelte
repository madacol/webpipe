<script>
    import { hoveringNode, selectorExplorerNode } from "./stores";

    /**
     * get coords of any element relative to the document
     * simplified version of https://stackoverflow.com/a/26230989/3163120
     * @param {HTMLElement} elem
     */
    function getCoords(elem) { // crossbrowser version
        const box = elem.getBoundingClientRect();
        const top  = box.top +  window.scrollY;
        const left = box.left + window.scrollX;
        return { top: Math.round(top), left: Math.round(left) };
    }

    /** @type {number}*/ let left = 0;
    /** @type {number}*/ let top  = 0;
    $: if ($hoveringNode) ({left, top} = getCoords($hoveringNode))
</script>

{#if $hoveringNode}
    <div bind:this={$selectorExplorerNode} id="floatingButton" style="
        left: {left}px;
        top: {top}px;
    ">
        <button>
            @
        </button>
    </div>
{/if}

<style>
    #floatingButton {
        position: absolute;
    }
</style>