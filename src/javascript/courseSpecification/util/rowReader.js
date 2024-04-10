import { filterNonHTMLElements } from './filter'
import { getArbitraryElementValue } from './constants'
/**
 * this function takes a table body element (tBody) and will iterate
 * throw it's rows, reading all input's values and returning them
 * as array of Json data while using the supplied names as keys for said values.
 * 
 * And it will also take in a starting and ending row number. if empty,
 * then it will defualt by reading everything (including header rows :P).
 * 
 * @param {HTMLTableSectionElement} p_table 
 * @param {[String]} p_names
 * @param {Number} p_rowStart
 * @param {Number} p_rowEnd
 * @returns {[Object]}
 */
export function readRowsOfInputs(p_table, p_names, p_rowStart, p_rowEnd, p_colStart){

    if(!(p_table instanceof HTMLTableSectionElement)){
        throw new Error('Please pass a HTML table element.')
    }
    
    //retrieve all child nodes
    /**@type {Array.<HTMLElement>} */
    const children = filterNonHTMLElements(p_table.childNodes)

    //prepate Json array variable
    /**@type {Array.<JSON>} */
    let obj = []

    if(!p_colStart){
        p_colStart = 0
    }

    //iterate through every node
    for(let i = 0; i < children.length; i++){
        if(i < p_rowStart){
            continue
        }

        if(i == p_rowEnd){
            break
        }

        /**@type {JSON} */
        let inputValues = {}

        /**@type {Array.<HTMLElement>} */
        const rowChildren = filterNonHTMLElements(children[i].childNodes)

        for(let j = 0; j < rowChildren.length - p_colStart; j++){

            inputValues[`${p_names[j]}`] = filterNonHTMLElements(rowChildren[j + p_colStart].childNodes)[0].value
        }

        obj.push(inputValues)

    }

    return obj
}

/**
 * this function takes a table body element (tBody) and will iterate
 * throw it's rows, reading all element's values and returning them
 * as array of Json data while using the supplied names as keys for said values.
 * 
 * And it will also take in a starting and ending row and collumn number (for now ending row isn't supported). if empty,
 * then it will defualt by reading everything (including header rows :P).
 * @param {HTMLTableSectionElement} p_table 
 * @param {[String]} p_names
 * @param {Number} p_rowStart
 * @param {Number} p_rowEnd
 * @returns {[Object]}
 */
export function readRowsOfArbitraryElements(p_table, p_names, p_rowStart, p_rowEnd, p_colStart){

    if(!(p_table instanceof HTMLTableSectionElement)){
        throw new Error('Please pass a HTML table element.')
    }
    
    //retrieve all child nodes
    /**@type {Array.<HTMLElement>} */
    const children = filterNonHTMLElements(p_table.childNodes)

    //prepate Json array variable
    /**@type {Array.<JSON>} */
    let obj = []

    if(!p_colStart){
        p_colStart = 0
    }

    //iterate through every node
    for(let i = 0; i < children.length; i++){
        if(i < p_rowStart){
            continue
        }

        if(i == p_rowEnd){
            break
        }

        /**@type {JSON} */
        let inputValues = {}

        /**@type {Array.<HTMLElement>} */
        const rowChildren = filterNonHTMLElements(children[i].childNodes)

        for(let j = 0; j < rowChildren.length - p_colStart; j++){

            const elements = filterNonHTMLElements(rowChildren[j + p_colStart].childNodes)

            try{
                inputValues[`${p_names[j]}`] = getArbitraryElementValue[elements[0].nodeName](elements[0])
            }catch(err){
                throw new Error("Unsupported HTML node.\nretrieved node: " + elements[0].nodeName)
            }
            
        }

        obj.push(inputValues)

    }

    return obj
}

