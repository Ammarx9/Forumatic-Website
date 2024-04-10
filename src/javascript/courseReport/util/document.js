import { doc, getDoc, where, query, getDocs, setDoc, addDoc, updateDoc, DocumentReference, QuerySnapshot, Query } from "firebase/firestore";

/**
 * Uses a document reference to retrieve it's reference target.
 * 
 * 
 * @param {DocumentReference} p_docRef 
 * @returns 
 */
export async function getDocDataByRef(p_docRef){
    
    if(!(p_docRef instanceof DocumentReference)){
        throw new Error("Error, expected document refernece, did not get document reference.\n" + 
        "Object recieved: " + p_docRef)
    }

    let docData
    await getDoc(p_docRef)
    .then(function(doc){
        docData = doc.data();
    })

    return docData
}

export async function getDocDataArrayByRef(p_docRefArr){

    if(!p_docRefArr instanceof Array){
        throw new Error('please pass an array object.\n'
        + 'object recieved: ' + p_docRefArr)
    }

    if(p_docRefArr.length == 0){
        throw new Error('array recieved is empty.')
    }
    
    if(!(p_docRefArr[0] instanceof DocumentReference)){
        throw new Error("Error, expected document refernece, did not get document reference.\n" + 
        "Object recieved:\n"
      + p_docRefArr)
    }

    let docDataArr = []

    for(let i = 0; i < p_docRefArr.length; i++){
        
        const doc = await getDoc(p_docRefArr[i])

        docDataArr.push(doc.data())
    }

    return docDataArr
}

export async function getDocByRef(p_docRef){

    if(!(p_docRef instanceof DocumentReference)){
        throw new Error("Error, expected document refernece, did not get document reference.\n" + 
        "Object recieved:\n"
      + p_docRef)
    }

    let docObj
    await getDoc(p_docRef)
    .then(function(doc){
        docObj = doc;
    })

    return docObj
}

export async function getDocIdData(p_collectionReference, p_docId){

    const documentReference = doc(p_collectionReference, p_docId)

    let docData
    await getDoc(documentReference)
    .then(function(doc){
        docData = doc.data()
    })

    return docData
}

export async function getDocRefById(p_collectionReference, p_docId){

    const documentReference = doc(p_collectionReference, p_docId)

    return documentReference
}

export function createQuery(p_collRef, p_params){

    //check if patameter is undefined
    if(!p_params){
        throw new Error('please do not pass undefined parameters.')
    }

    //check if parameter is an array
    if(!p_params instanceof Array){
        throw new Error('please pass an array of query arguments')
    }

    //check if array has the correct length
    if(p_params.length % 3 != 0){
        throw new Error('please make sure you enter the array in multiple of 3 values (field, operator, value).')
    }

    //prepare where array container
    const whereArgs = []

    //pass constraints information while creating where constraints
    for(let i = 0; i < p_params.length; i = i + 3){
        whereArgs.push(where(p_params[i], p_params[i+1], p_params[i+2]))
    }

    //return query object
    if(whereArgs.length == 0){
        return query(p_collRef)
    }else{
        return query(p_collRef, ...whereArgs)
    }
}

/**
 * 
 * @param {Query} p_query 
 * @returns {QuerySnapshot}
 */
export async function getDocQuery(p_query){

    const snapshot = await getDocs(p_query)

    return snapshot
}

export async function createDoc(p_collectionRef, p_objData){

    let docRef = await addDoc(p_collectionRef, p_objData)

    return docRef
}

export async function createDocWithName(p_db, p_collectionPath, p_docName, p_objData){

    let docObj = doc(p_db, p_collectionPath, p_docName)

    let docRef = await setDoc(docObj, p_objData)

    return docRef
}

export async function updateDocByRef(p_docRef, p_objData){

    await updateDoc(p_docRef, p_objData)

}

/**
 * this function will update the corresponding document id using the
 * supplied Json object.
 * 
 * @param {CollectionReference} p_collectionRef 
 * @param {String} p_docID 
 * @param {JSON} p_objData 
 */
export async function updateDocByID(p_collectionRef, p_docID, p_objData){

    const docRef = doc(p_collectionRef, p_docID)

    if(!docRef){
        console.log('doc ref is null')
    }

    await updateDoc(docRef, p_objData)
}