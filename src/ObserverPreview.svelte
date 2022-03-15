<script>
    /**
     * get coords of any element relative to the document
     * simplified version of https://stackoverflow.com/a/26230989/3163120
     * @param {HTMLElement} elem
     */
    function getCoords(elem) { // crossbrowser version
        const box = elem.getBoundingClientRect();
        const top  = box.top  + window.scrollY;
        const left = box.left + window.scrollX;
        return { top: Math.round(top), left: Math.round(left) };
    }

    /**@type {HTMLElement}*/ 
    export let hoveringNode = null;
    /** @type {number}*/ let left = 0;
    /** @type {number}*/ let top  = 0;
    $: if (hoveringNode) {
        ({left, top} = getCoords(hoveringNode))
    }

    /** @type {boolean}*/ let isActive = false;
    /** @type {[string]}*/ let classes=[];
    /** @type {[string]}*/ let attributes=[];
</script>

{#if hoveringNode}
    <div id="floatingButton" style="
        left: {left}px;
        top: {top}px;
    ">
        <button on:click={()=>isActive=!isActive}>
            @
        </button>
        {#if isActive}
            {#each hoveringNode.classList as classString }
                <span>{classString}</span>
                <input type="checkbox" bind:group={classes} value={classString}>
            {/each}
            <hr>
            {#each hoveringNode.attributes as {name, value} }
                <span>{`[${name}=${value}]`}</span>
                <input type="checkbox" bind:group={attributes} value={`[${name}=${value}]`}>
            {/each}
        {/if}
    </div>
{/if}

<style>
    #floatingButton {
        position: absolute;
    }
</style>