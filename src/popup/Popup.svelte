<script>
    import { sendAttachSignal, sendToActiveTab } from "../utils"

    /**
     * @typedef {import('../background').Observers} Observers
     * 
     * @type {Observers}
     */
    let observers;
    let cssSelector;

    // set `observers` from background.js context
    browser.runtime.getBackgroundPage().then(window => {
        observers = window.observers
        cssSelector = window.cssSelector
    })
    // mark `observers` as "dirty" everytime an update arrives
    browser.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
        switch (payload.action) {
            case "update":
                observers = observers // this tells svelte to mark it as dirty and force an update
                break;
        }
    })
    function onChangeSelector(observer) {
        return ()=>browser.tabs.sendMessage(
            observer.tab.id,
            {
                action: "updateSelector",
                cssSelector: observer.cssSelector,
                idx: observer.idx
            }
        )
    }
</script>
<div id="popup">
    <span>{cssSelector}</span>
    <button on:click={()=>sendToActiveTab({action: "getSelector"})}>Get selector</button>
    |
    <button on:click={()=>sendToActiveTab({action: "observeMode"})}>Observe</button>
    {#if observers && Object.values(observers).length > 0}
        <section>
            <div class="observer header">
                <span>selector</span>
                <span>current text</span>
                <div></div>
            </div>
            {#each Object.values(observers) as observer (`${observer.tab.id}_${observer.idx}`)}
                <div class="observer">
                    <input
                        bind:value={observer.cssSelector}
                        on:change={onChangeSelector(observer)}
                    />
                    <span>{observer.textContent}</span>
                    <button on:click={()=>sendAttachSignal(observer)}>attach</button>
                </div>
            {/each}
        </section>
    {/if}
</div>

<style>
    #popup {
        text-align: right;
    }
    section {
        display: flex;
        flex-direction: column;
        margin-top: 0.5em;
    }
    .observer {
        display: grid;
        grid-template-columns: 1fr 3fr 1fr;
        column-gap: 0.5em;
        padding: 0.5em;
        border-top: 1px solid black;
    }
    .observer span {
        max-height: 3.5em;
        overflow: auto;
    }
</style>