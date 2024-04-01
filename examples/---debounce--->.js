let timeoutId;
let resolve;

const DELAY = 1000;

(message) => {
    clearTimeout(timeoutId)

    if (!resolve) return new Promise(resolve_ => resolve = resolve_);
    
    timeoutId = setTimeout(()=>{
        resolve({message});
        resolve = undefined;
    }, DELAY)
}