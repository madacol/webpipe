<script>
    import { sendToActiveTab } from "../utils"

    let observers;

    // set `observers` from background.js context
    browser.runtime.getBackgroundPage().then(window => observers = window.observers)
    // mark `observers` as "dirty" everytime an update arrives
    browser.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
        switch (payload.action) {
            case "update":
                observers = observers // this tells svelte to mark it as dirty and force an update
                break;
        }
    })
</script>
<div id="popup">
    <button on:click={()=>sendToActiveTab({action: "observeMode"})}>Observe</button>
    <section>
        {#if observers}
            {#each Object.values(observers) as tabObservers}
                {#each Object.values(tabObservers) as {textContent}}
                    <div class="observer">
                        <span>{textContent}</span>
                        <button>attach</button>
                    </div>
                {/each}
            {/each}
        {/if}
    </section>
</div>

<style>
    #popup {
        text-align: right;
    }
    section {
        display: flex;
        flex-direction: column;
    }
    .observer {
        display: grid;
        grid-template-columns: 3fr 1fr;
        gap: 0.5em;
        padding: 0.5em;
    }
    .observer span {
        max-height: 3.5em;
        overflow: auto;
    }
</style>