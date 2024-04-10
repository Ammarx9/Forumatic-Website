import { getFirestoreDB, startFirebaseApp } from "./util/firestoreApp"
import { getCollection } from "./util/collection"
import { getDocRefById, createDoc, updateDocByRef, createQuery, getDocQuery } from "./util/document"
import { generateOption } from "./util/optionGenerator"
const g_app = startFirebaseApp()
//get firestore db
const g_db = await getFirestoreDB()
const s_depratment = document.getElementById('S_department')
//get courses collection reference
const g_courseSpecificationCollRef = await getCollection(g_db, 'courseSpecification')
const g_departmentCollRef = await getCollection(g_db, 'department')
const query_department = createQuery(g_departmentCollRef, [])
const g_departmentSnapshot = await getDocQuery(query_department)
g_departmentSnapshot.forEach((doc) => {
    const data = doc.data()
    const option = generateOption(data.name, doc.id)
    s_depratment.appendChild(option)
})
//get create button element
const g_createButton = document.getElementById("B_create")
//set click event listener
g_createButton.addEventListener('click', async function clickHandle(handle){
    const department = document.getElementById('S_department').value
    //get title value
    const courseTitle = document.getElementById("I_title").value
    //get code value
    const courseCode = document.getElementById("I_code").value
    //prepare course specification object data
    let obj = {
        courseTitle: courseTitle,
        courseCode: courseCode,
        depratment: await getDocRefById(g_departmentCollRef, department),
        status: 'new'
    }
    const courseSpecificationRef = await createDoc(g_courseSpecificationCollRef, obj)
})
