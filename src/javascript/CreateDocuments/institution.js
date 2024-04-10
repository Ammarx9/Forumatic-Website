import { getCollection } from "./util/collection";
import { getDocRefData, getDocIdData, createDoc } from "./util/document";
import { getFirestoreDB, startFirebaseApp } from "./util/firestoreApp";
const g_app = startFirebaseApp()
const g_firestoreDB = await getFirestoreDB()
const g_collectionReference = await getCollection(g_firestoreDB, "institution")
const g_buttonElement = document.getElementById("B_create")
g_buttonElement.addEventListener('click', function handleClick(handle){
    const name = document.getElementById('I_name').value
    const location = document.getElementById('I_location').value
    const obj = {
        name: name,
        location: location
    }
    console.log(obj)
    createDoc(g_collectionReference, obj)
})
