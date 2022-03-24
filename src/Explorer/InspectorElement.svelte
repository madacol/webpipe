<script>
    /**@type {HTMLElement}*/
    export let hoveringNode
    /**@type {HTMLElement}*/
    export let element

    let initialOuterHtml
    $: if (element) {
        const clone = element.cloneNode()
        clone.classList.remove("element-picking")
        initialOuterHtml = clone.outerHTML.replace(/<\/.*/, "")
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
        {initialOuterHtml}
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
        padding-left: 6em;
        max-height: 3.5em;
        overflow-x: auto;
    }
    span:hover {
        background-color: #066
    }
</style>