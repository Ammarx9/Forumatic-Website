export function addRows(currentRow, templateRow){
    const tableBody = currentRow.parentNode;

    for(var i = 0; i < tableBody.childNodes.length; i++){
        if(tableBody.childNodes[i].isEqualNode(currentRow)){
            tableBody.insertBefore(templateRow, tableBody.childNodes[i]);
        }
    }
}

export function addRowsAndShiftItems(currentRow, templateRow, toBeShiftedItems, toRowSpanCell){

    const tableBody = currentRow.parentNode//get table body (not table element)

    const newRow = document.createElement('tr')

    currentRow.after(newRow)//add new row into table

    for(var i = 0; i < currentRow.childNodes.length; i++){//loop through current row to shift desired elements
        
        if(currentRow.childNodes[i].nodeType == Node.ELEMENT_NODE){//ignore new lines

            for(var j = 0; j < toBeShiftedItems.length; j++){
                
                if(currentRow.childNodes[i] == toBeShiftedItems[j]){//check desired elements from array
                    
                    newRow.appendChild(toBeShiftedItems[j])

                }

            }

        }
    }//shifting finished

    for(var i = 0; i < templateRow.length; i++){//append new text inputs into current row
        currentRow.appendChild(templateRow[i])
    }

    if(toRowSpanCell.getAttribute('rowspan')){
        toRowSpanCell.setAttribute('rowspan', toRowSpanCell.getAttribute('rowspan') + 1)
    }else{
        toRowSpanCell.setAttribute('rowspan', 2)
    }

    //currentRow.childNodes[1].setAttribute('rowspan', currentRow.childNodes[1].getAttribute('rowspan'))

    /*for(var i = 0; i < Object.entries(tmeplateRow).length; i++){
        //currentRow.appendChild(templateRow[i])
        console.log('yes')
    }*/
}