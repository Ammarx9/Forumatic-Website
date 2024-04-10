import { getFirestoreDB, startFirebaseApp } from "./util/firestoreApp"
import { getCollection } from "./util/collection"
import { getDocRefById, createDoc, createQuery, getDocQuery } from "./util/document"
import { generateOption } from "./util/optionGenerator"
const S_PLO = document.getElementById('S_PLO')
const R_type = document.querySelector(`input[type="radio"][name="R_type"]:checked`)
const I_LearningOutcomes = document.getElementById('I_LearningOutcomes')
const I_assessmentMethod = document.getElementById('I_assessmentMethod')
const I_TargetLevel = document.getElementById('I_TargetLevel')
const I_teachingStrageties = document.getElementById('I_teachingStrageties')
const B_create = document.getElementById('B_create')
B_create.setAttribute('disabled', 'disabled')
const g_app = startFirebaseApp()
const g_firestoreDB = await getFirestoreDB()
const g_PLOCol = await getCollection(g_firestoreDB, 'PLO')
const g_CLOCol = await getCollection(g_firestoreDB, 'clo')
const query_PLO = createQuery(g_PLOCol, [])
const snapshot_PLO = await getDocQuery(query_PLO)
snapshot_PLO.forEach((doc) => {
    const data = doc.data()
    const option = generateOption(data.description + ' : ' + data.type, doc.id)
    S_PLO.appendChild(option)
})
B_create.addEventListener('click', async function(){
    const obj = {
        PLORef: await getDocRefById(g_PLOCol, S_PLO.value),
        type: document.querySelector(`input[type="radio"][name="R_type"]:checked`).value,
        learningOutcome: I_LearningOutcomes.value,
        assessmentMethod: I_assessmentMethod.value,
        targetLevel: Number(I_TargetLevel.value),
        teachingStrageties: I_teachingStrageties.value
    }
    const doc = await createDoc(g_CLOCol, obj)
    console.log(doc.id)
})
B_create.removeAttribute('disabled')