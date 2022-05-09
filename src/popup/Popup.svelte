<script>
    import { sendAttachSignal, sendToActiveTab } from "../utils"

    /**
     * @typedef {import('../background').Observers} Observers
     * 
     * @type {Observers}
     */
    let observers;
    let cssSelector;

    // set `cssSelector` from background.js context
    browser.runtime.getBackgroundPage().then(window => cssSelector = window.cssSelector)

    // set `observers` from storage
    browser.storage.local.get().then(storage => observers = storage)

    // Update `observers` everytime an observer updates
    browser.storage.onChanged.addListener(async (_, areaName) => {
        if (areaName !== "local") return
        observers = (await browser.storage.local.get())
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
    <button on:click={async ()=>{await sendToActiveTab({action: "observeMode"}); window.close();}}>Observe</button>
    {#if observers && Object.values(observers).length > 0}
        <section>
            <!-- <div class="observer header"> -->
                <span class="header">selector</span>
                <span class="header">idx</span>
                <span class="header">current text</span>
                <span class="header">tabId</span>
            <!-- </div> -->
            {#each Object.values(observers) as observer (`${observer.tab.id}_${observer.idx}`)}
                <!-- <div class="observer"> -->
                    <input
                        bind:value={observer.cssSelector}
                        on:change={onChangeSelector(observer)}
                    />
                    <span>{`${observer.tab.id}_${observer.idx}`}</span>
                    <span>{observer.textContent}</span>
                    <button on:click={async ()=>{await sendAttachSignal(observer); window.close();}}>attach</button>

                    {#each observer.pipes as pipe}
                            <span>{pipe.cssSelector}</span>
                            <span>{pipe.idx}</span>
                            <span>{pipe.url}</span>
                            <span>{pipe.tabId}</span>
                    {/each}
                <!-- </div> -->
            {/each}
        </section>
    {/if}
</div>

<style>
    #popup {
        text-align: right;
    }
    section {
        display: grid;
        grid-template-columns: repeat(4, min-content);
        column-gap: 0.5em;
        padding: 0.5em;
        margin-top: 0.5em;
        border-top: 1px solid black;
    }
    section span {
        max-height: 3.5em;
        padding: 0.3em;
        overflow: auto;
    }
</style>