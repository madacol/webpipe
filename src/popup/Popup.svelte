<script>
    import { sendToActiveTab } from "../utils"
</script>

<section>
    <button on:click={()=>sendToActiveTab({action: "observeMode"})}>Observe</button>
    <button>Send</button>
</section>

<style>
</style>