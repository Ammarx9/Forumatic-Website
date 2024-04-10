/**
 * 
 * @param {String} p_optionName 
 * @param {String} p_optionValue 
 * @returns {HTMLOptionElement}
 */
export function generateOption(p_optionName, p_optionValue){
    const optionElement = document.createElement('option')//create option element

    optionElement.innerHTML = p_optionName
    optionElement.value = p_optionValue

    return optionElement
}