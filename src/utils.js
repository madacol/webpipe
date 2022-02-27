export function getNodeFromSelector(cssSelector) {
    const nodes = document.querySelectorAll(cssSelector)
    if (nodes.length > 1) console.warn(`Multiple nodes found for selector "${cssSelector}". Choosing first one`, nodes);
    return nodes[0]
}
