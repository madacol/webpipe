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
    <div class="title">
        <span>WEBPIPE</span>
        <span>v1.0</span>
        <button on:click={async ()=>{await sendToActiveTab({action: "observeMode"}); window.close();}}>Observe</button>
    </div>
    {#if observers && Object.values(observers).length > 0}
        <section>
            <!-- <div class="observer header"> -->
                <span class="header">alias</span>
                <span class="header">selector</span>
                <span class="header">url</span>
                <span class="header">current text</span>
                <span class="header"></span>
            <!-- </div> -->
            {#each Object.values(observers) as observer (`${observer.tab.id}_${observer.idx}`)}
                <!-- <div class="observer"> -->
                    <hr>
                    <span>ejemplo</span>
                    <input
                        bind:value={observer.cssSelector}
                        on:change={onChangeSelector(observer)}
                    />
                    <span title={observer.tab.url}>{observer.tab.url}</span>
                    <span title={observer.textContent}>{observer.textContent}</span>
                    <button on:click={async ()=>{await sendAttachSignal(observer); window.close();}}>attach</button>
                    {#if observer.pipes.length > 0}
                        <div class="pipes">
                            <span class="header"></span>
                            <span class="header">url</span>
                            <span class="header">selector</span>
                            <hr>
                            {#each observer.pipes as pipe}
                                    <span>delete</span>
                                    <span title={pipe.url}>{pipe.url}</span>
                                    <span title={pipe.cssSelector}>{pipe.cssSelector}</span>
                            {/each}
                        </div>
                    {/if}
                <!-- </div> -->
            {/each}
        </section>
    {/if}
</div>

<style>
    #popup {
        text-align: right;
        font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #2b2a33;
        margin: 0;
        padding: 0;
        color: white;
    }
    .header{
        text-align: left;
    }
    .title{
        padding: 1em;
    }
    section {
        display: grid;
        grid-template-columns: min-content min-content auto auto min-content;
        column-gap: 2em;
        padding: 0.5em;
        border-top: 1px solid white;
    }
    .pipes{
        grid-column: 2 / -1;
        display: grid;
        grid-template-columns: min-content auto auto;
        column-gap: 2em;
    }
    section span {
        max-height: 1.5em;
        padding: 0.3em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    hr {
        grid-column: 1 / -1;
        width: 100%;
    }
</style>