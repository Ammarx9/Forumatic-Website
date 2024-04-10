import { collection, CollectionReference } from "firebase/firestore";

export async function getCollection(p_db, p_collectionName){

    const collectionReference = collection(p_db, p_collectionName)

    /*if(collectionReference){
        console.error("Failed to establish a collection reference.\n"
                    + "recieved collection name: \"" + p_collectionName + "\"")
    }*/

    return collectionReference
}

let test