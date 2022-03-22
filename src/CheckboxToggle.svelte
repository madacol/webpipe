<script>
    // export let /**@type {boolean}*/ checked;
    export let /**@type {[]}*/ checked;
    export let /**@type {string}*/ label;
</script>

<div>
    <label>
        <input
            on:change
            bind:checked
            value={label}
            type="checkbox"
        >
        <div>
            <span/>
        </div>
        <span>&nbsp;{label}</span>
    </label>
</div>

<style>

div {
    display: flex;
    justify-content: center;
}

label {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}
label > span {
    max-width: 400px;
    overflow: auto;
    user-select: text;
}


/* Hide default HTML checkbox */
input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

label > div {
    display: inline-block;
    position: relative;
    width: 2.4em;
    height: 1.3em;
}

/* The slider */
div > span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(99, 99, 99);
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 1.3em;
}

div > span:before {
    position: absolute;
    content: "";
    height: 1em;
    width: 1em;
    left: 0.15em;
    bottom: 0.15em;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    border-radius: 50%;
}

input:checked + div > span {
    background-color: rgb(95, 95, 51);
}

input:focus + div > span {
    box-shadow: 0 0 1px yellow;
}

input:checked + div > span:before {
    -webkit-transform: translateX(1em);
    -ms-transform: translateX(1em);
    transform: translateX(1em);
}
</style>