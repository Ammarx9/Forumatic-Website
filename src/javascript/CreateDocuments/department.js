import { getFirestoreDB, startFirebaseApp } from "./util/firestoreApp"
import { getCollection } from "./util/collection"
import { getDocRefById, createDoc } from "./util/document"
import { generateOption } from "./util/optionGenerator"
import { query, getDocs } from "firebase/firestore"
const g_app = startFirebaseApp()
//get firestore db
const g_db = await getFirestoreDB()
//get departments collection reference
const g_departmentCollRef = await getCollection(g_db, 'department')
//get colleges collection reference
const g_collegesCollRef = await getCollection(g_db, 'college')
//get create button element
const g_createButton = document.getElementById("B_create")
//get select department element
const g_collegeSelection = document.getElementById("S_colleges")
//prepare collection query
const q = query(g_collegesCollRef)
//get snapshot of all documents
const snapshot = await getDocs(q)
//loop through all retrieved documents
snapshot.forEach((doc) => {
    //get document data
    const data = doc.data()
    //generate new option
    const option = generateOption(data.name, doc.id)
    //append option child to selection
    g_collegeSelection.appendChild(option)
})
g_createButton.addEventListener('click', async function handleClick(handle){
    const collegeId = g_collegeSelection.value
    const departmentName = document.getElementById('I_name').value
    const collegeRef = await getDocRefById(g_collegesCollRef, collegeId)
    const obj = {
        name: departmentName,
        college: collegeRef
    }
    createDoc(g_departmentCollRef, obj)
})
