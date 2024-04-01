let timeoutId;
let resolve;

const DELAY = 3000;

(chatgpt_response) => { //    [class^=react-scroll-to-bottom--css] >*>:nth-last-child(2) .markdown
    clearTimeout(timeoutId)

    if (!resolve) return new Promise(resolve_ => resolve = resolve_)
    
    timeoutId = setTimeout(()=>{
        resolve({chatgpt_response: "*ChatGPT:*\n " + chatgpt_response})
        resolve = undefined
    }, DELAY)
}