import { generateOption } from './util/optionGenerator'
import { getCollection } from "./util/collection";
import { getDocRefData, getDocIdData, createDoc, getDocRefById } from "./util/document";
import { startFirebaseApp, getFirestoreDB } from "./util/firestoreApp";
import { query, where, getDocs, DocumentReference } from 'firebase/firestore';
const g_createElement = document.getElementById("B_create")
const g_institutionSelection = document.getElementById("S_institutions")
const g_app = startFirebaseApp()
const g_firestoreDB = await getFirestoreDB()
const g_collegeCollectionReference = await getCollection(g_firestoreDB, "college")
const g_institutionCollectionReference = await getCollection(g_firestoreDB, "institution")
const q = query(g_institutionCollectionReference);
const snapshot = await getDocs(q)
snapshot.forEach((doc) => {
    const data = doc.data()
    console.log(data.name)
    const option = generateOption(data.name, doc.id)
    g_institutionSelection.appendChild(option)
})
g_createElement.addEventListener('click', async function handleClick(handle){
    const institutionId = g_institutionSelection.value
    const collegeName = document.getElementById('I_name').value
    const institutionRef = await getDocRefById(g_institutionCollectionReference, institutionId)
    const obj = {
        name: collegeName,
        intitution: institutionRef
    }
    createDoc(g_collegeCollectionReference, obj)
})
