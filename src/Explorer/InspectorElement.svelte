<script>
    /**@type {HTMLElement}*/
    export let hoveringNode
    /**@type {HTMLElement}*/
    export let element

    let openingOuterHtml
    $: if (element) {
        const clone = element.cloneNode()
        clone.classList.remove("element-picking")
        openingOuterHtml = clone.outerHTML.replace(/<\/.*/, "") // remove closing tag
    }

    function onMouseOver() {
        hoveringNode.classList.remove("element-picking")
        element.classList.add("element-picking")
    }
    function onMouseOut() {
        element.classList.remove("element-picking")
        hoveringNode.classList.add("element-picking")
    }
</script>

<span
    on:click={()=>hoveringNode=element}
    on:mouseover={onMouseOver} on:focus={onMouseOver}
    on:mouseout={onMouseOut} on:blur={onMouseOut}
>
    {#if element}
        {openingOuterHtml}
    {/if}
</span>


<style>
    span:first-child {
        padding-left: 0;
    }
    span:nth-child(2) {
        padding-left: 2em;
    }
    span:nth-child(3) {
        padding-left: 4em;
        background-color: #066
    }
    span {
        cursor: pointer;
        padding-top: 0.5em;
        padding-bottom: 0.5em;
        padding-left: 6em;
        max-height: 3.5em;
        min-height: 1em;
        overflow-x: auto;
    }
    span:nth-child(2n) {
        background-color: rgb(54, 54, 54);
    }
    span:hover {
        background-color: #066
    }
</style>