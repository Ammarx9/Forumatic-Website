/**
 * 
 * @param {NodeList} p_childNodes 
 * @returns {Array.<HTMLElement>}
 */
export function filterNonHTMLElements(p_childNodes){
    if(!p_childNodes instanceof NodeList){
        throw new Error(`Please pass a NodeList.\n Object recieved: ${p_childNodes}`)
    }

    const nodeArr = Array.from(p_childNodes)

    if(!nodeArr.some(node => node.nodeType === 1)){
        throw new Error('Please pass an array with at least one HTML element.\n'
        + 'Object recieved: ' + nodeArr)
    }

    /**@type {Array.<HTMLElement>}*/
    const HTMLElements = Array.prototype.filter.call(nodeArr, function(node){
        return node.nodeType === 1
    })

    return HTMLElements
}