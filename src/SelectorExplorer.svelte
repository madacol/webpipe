<script>
    import { node } from "./stores";

    /** @type {number}*/
    let right, top = 0;
    $: if ($node) ({right, top} = $node.getBoundingClientRect())
</script>

{#if $node}
    <div id="floatingButton" style="
        left: {right}px;
        top: {top}px;
    ">
        @
    </div>
{/if}

<style>
    #floatingButton {
        position: absolute;
        width: 10px;
        height: 10px;
    }
</style>