/**
 * Observers logic
 */
{
    const observers = []
    function observeNode(e) {
        const node = e.target
        const observer = new MutationObserver(function (mutationsList, observer) {
            const payload = {
                type: "observe",
                idx: observers.indexOf(observer),
                textContent: node.textContent
            }
            console.log(payload);
            browser.runtime.sendMessage(payload, response =>{
                if (!response) return // Success
                // Failed
                observer.disconnect()
                observers.splice(payload.idx, 1) // remove observer
            })
        })
        observer.observe(node, { attributes: true, childList: true, subtree: true, characterData: true })
        observers.push(observer)
        document.body.removeEventListener("click", observeNode)
    }
    document.body.addEventListener("click", observeNode)
}

/**
 * Add class .pipehover on hover to all elements
 */
{
    for (const element of document.getElementsByTagName("*")) {
        element.addEventListener("mouseover", e=>{e.currentTarget.classList.add("pipehover"); e.stopPropagation()})
        element.addEventListener("mouseout", e=>e.currentTarget.classList.remove("pipehover"))
    }
}

/**
 * Add CSS for .pipehover
 */
{
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        .pipehover {
            border: 5px solid red !important
        }
    `
    document.head.appendChild(styleSheet)
}
