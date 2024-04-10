/**
 * Will create a "tr" element with "td" elements and 
 * each has "input[type='text']" element, where String array values
 * are used to fill in inputs as value.
 * @param {[String]} p_value 
 * @returns {HTMLTableRowElement}
 */
export function generateRowOfInputs(p_value){
    const tableRow = document.createElement('tr')

    for(let i = 0; i < p_value.length; i++){
        const header = document.createElement('th')
        
        const input = document.createElement('input')
        input.value = p_value[i]
        input.type = 'text'

        header.appendChild(input)
        tableRow.appendChild(header)
    }

    return tableRow
}

/**
 * Will create a "tr" element with "td" elements and 
 * each has "textarea" element, where String array values
 * are used to fill in text areas as value.
 * @param {[String]} p_value 
 * @returns {HTMLTableRowElement}
 */
export function generateRowOfTextareas(p_value){
    const tableRow = document.createElement('tr')

    for(let i = 0; i < p_value.length; i++){
        const header = document.createElement('th')
        
        const textarea = document.createElement('textarea')
        textarea.value = p_value[i]

        header.appendChild(textarea)
        tableRow.appendChild(header)
    }

    return tableRow
}

/**
 * Will create a "tr" element with "td" elements and 
 * each has "textarea" element, where String array values
 * are used to fill in text areas as value.
 * @param {[String]} p_value 
 * @returns {HTMLTableRowElement}
 */
export function generateRowOfParagraphs(p_value){
    const tableRow = document.createElement('tr')

    for(let i = 0; i < p_value.length; i++){
        const header = document.createElement('th')
        
        const textarea = document.createElement('p')
        textarea.innerHTML = p_value[i]

        header.appendChild(textarea)
        tableRow.appendChild(header)
    }

    return tableRow
}

/**
 * Will create a "tr" element with "td" elements and 
 * each has "textarea" element, where String array values
 * are used to fill in text areas as value.
 * @param {[String]} p_elements
 * @param {[String]} p_value 
 * @returns {HTMLTableRowElement}
 */
export function generateRowOfArbitraryElements(p_elements, p_value){
    if(p_elements.length != p_value.length){
        throw new Error("The arrays must be of same length.")
    }
    const tableRow = document.createElement('tr')

    for(let i = 0; i < p_value.length; i++){
        const header = document.createElement('th')
        
        const textarea = document.createElement(p_elements[i])
        textarea.innerHTML = p_value[i]

        header.appendChild(textarea)
        tableRow.appendChild(header)
    }

    return tableRow
}