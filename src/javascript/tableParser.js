export function parseTableToJson(tableElement, startingRow, lastRow, ignoreColumn){

    var defined = false

    var col = 'column'

    var json = {};
    //get row children
    const children = tableElement.childNodes[1].childNodes

    for(var i = 0; i < children.length; i++){
        if(children[i].nodeType == Node.ELEMENT_NODE){//ignore new lines
            if(startingRow > 0){//ignore starting rows
                startingRow--;
                continue
            }

            if(lastRow == -1){//checks weither to read all the way in, or up to a certain range.
                if(i == children.length-2){//exit loop if reached end of table
                    break
                }
            }else if(i > lastRow){//exit loop if reached read limit
                break
            }

            var rowChildren = children[i].childNodes//get children of a single row

            //define json object to return based on row's children
            if(!defined){

                const diffrence = rowChildren.length - ignoreColumn//using current length and ignored column to figure out json format

                for(var j = 0; j < diffrence; j++){
                    
                    var newCol = col + (j+1)

                    json[newCol] = []
                }

                defined = !defined
            }
            

            for(var j = 0; j < rowChildren.length; j++){
                if(rowChildren[j].nodeType == Node.ELEMENT_NODE){

                    if(j < ignoreColumn){//ignore column
                        continue
                    }

                    var subRowChildren = rowChildren[j].childNodes//get children of a single cell

                    for(var t = 0; t < subRowChildren.length; t++){

                        if(subRowChildren[t].nodeType != Node.ELEMENT_NODE){//ignore new lines
                            continue
                        }

                        var temp = subRowChildren[t].type

                        if(temp != undefined && temp === "text"){//check if not undefined and is of type text, didn't test it with other elements besides input element :P

                            var keys = Object.keys(json)//get key names

                            json[keys[j - ignoreColumn]].push(subRowChildren[t].value)//extract information and push them into json object

                        }
                    }
                }
            }
        }
    }

    return json
}