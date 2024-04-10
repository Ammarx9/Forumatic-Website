import { getFirestoreDB, startFirebaseApp } from "./util/firestoreApp"
import { getCollection } from "./util/collection"
import { getDocRefById, createDoc, updateDocByRef, createQuery, getDocQuery } from "./util/document"
import { generateOption } from "./util/optionGenerator";
import { getCurrentYearAndTerm } from './util/calender'
const g_app = startFirebaseApp()
//start firestore connection
const g_db = await getFirestoreDB()
//get course collection reference
const g_courseSpecificationCollRef = await getCollection(g_db, 'courseSpecification')
//get instructor collection reference
const g_instructorCollRef = await getCollection(g_db, 'instructor')
//get coordinator collection reference
const g_coordinatroCollRef = await getCollection(g_db, 'coordinator')
//get section collection reference
const g_sectionCollRef = await getCollection(g_db, 'section')
//get course report collection reference
const g_courseReportCollRef = await getCollection(g_db, 'courseReport')
//get create button element
const g_createButton = document.getElementById('B_create')
const g_courseSelection = document.getElementById('S_course')
const g_instructorSelection = document.getElementById('S_instructor')
const g_coordinatorSelection = document.getElementById('S_coordinator')
//set up course query
const g_courseSpecificationQuery = createQuery(g_courseSpecificationCollRef, [
    'status', 'not-in', ['new', 'pending']
])
//set up instructor query
const g_instructorQuery = createQuery(g_instructorCollRef, [])
//set up coordinator query
const g_coordinatorQuery = createQuery(g_coordinatroCollRef, [])
//get course snapshot
const g_courseSpecificationSnapshot = await getDocQuery(g_courseSpecificationQuery)
//get instructor snapshot
const g_instructorSnapshot = await getDocQuery(g_instructorQuery)
//get coordinator snapshot
const g_coordinatorSnapshot = await getDocQuery(g_coordinatorQuery)
//generate new options based on retrieved course values
g_courseSpecificationSnapshot.forEach((doc) => {
    const data = doc.data()
    const option = generateOption(data.courseTitle, data.courseCode)
    g_courseSelection.appendChild(option)
})
//generate new options based on retrieved instructor values
g_instructorSnapshot.forEach((doc) => {
    const data = doc.data()
    console.log(data.name)
    const option = generateOption(data.name, doc.id)
    g_instructorSelection.appendChild(option)
})
//generate new options based on retrieved coordinator values
g_coordinatorSnapshot.forEach((doc) => {
    const data = doc.data()
    console.log(data.name)
    const option = generateOption(data.name, doc.id)
    g_coordinatorSelection.appendChild(option)
})
//------------------------------------------------------------------
//---------------------Finished preparing data----------------------
//------------------------------------------------------------------
//-----------------Starting handling creating request---------------
//------------------------------------------------------------------
//add click event listener
g_createButton.addEventListener('click', async function eventHandler(handle){
    g_createButton.setAttribute('disabled', 'disabled')
    //get selected location
    const location = document.querySelector('input[name="R_campus"]:checked').value
    const calender = await getCurrentYearAndTerm(g_db)
    const courseCode = document.getElementById('S_course').value
    const instructorUID = document.getElementById('S_instructor').value
    const coordinatorUID = document.getElementById('S_coordinator').value
    //prepare section query
    const sectionQuery = createQuery(g_sectionCollRef, [
        'year', '==', calender.year,//specificy year
        'term', '==', calender.term,//specificy term
        'courseCode', '==', courseCode//specificy course
    ])
    //get section query
    const sectionDocs = await getDocQuery(sectionQuery)
    //get number of section retrieved, this will represent last assigned section number
    const currentSectionNum = sectionDocs.size
    //prepare course rpeort query
    const courseReportQuery = createQuery(g_courseReportCollRef, [
        'year', '==', calender.year,//specificy year
        'term', '==', calender.term,//specificy term
        'courseCode', '==', courseCode,//specificy course
        'instructor', '==', instructorUID//specificy instructor
    ])
    //get course report document
    let courseReportDoc = await getDocQuery(courseReportQuery)
    //if course report already exists, means an instructor already has been registerd to this course
    if(!courseReportDoc.empty){

        //prepate object data for creating new section document
        let obj = {
            campus: location,
            number: (currentSectionNum+1),
            courseCode: courseCode,
            year: calender.year,
            term: calender.term
        }

        //create section document and get it's reference
        const sectionRef = await createDoc(g_sectionCollRef, obj)

        //get course report document and it's section's reference array.
        let sectionArr
        courseReportDoc.forEach(function(doc){
            courseReportDoc = doc
            sectionArr = doc.data().section
        })

        //prepare obect data for updating existing course report document
        sectionArr.push(sectionRef)
        obj = {
            section: sectionArr
        }

        //update course report document
        updateDocByRef(courseReportDoc, obj)

        g_createButton.removeAttribute('disabled')

    }else{//if course report doesn't exists, means new instructor for a certain course
        //prepare object data for creating new section document
        let obj = {
            campus: location,
            number: (currentSectionNum+1),
            courseCode: courseCode,
            year: calender.year,
            term: calender.term
        }
        //create section document and get it's reference
        const sectionRef = await createDoc(g_sectionCollRef, obj)
        //prepare course specification query
        const courseSpecificationQuery = createQuery(g_courseSpecificationCollRef, [
            'status', '==', 'live',
            'courseCode', '==', courseCode
        ])
        //get course specification snapshot
        const courseSpecifcationSnapshot = await getDocQuery(courseSpecificationQuery)
        console.log(courseSpecifcationSnapshot.size)
        console.log(courseSpecifcationSnapshot.docs)
        console.log(courseSpecifcationSnapshot.metadata)
        if(courseSpecifcationSnapshot.empty){//apperantly, this method can't even work right. empty, isn't really empty.
            throw new Error('Did not find live specification for the corresponding course.\n'
            + 'Please complete the specification for said course.')
        }
        //prepare latest specification version
        let latestSpecificationVersion
        courseSpecifcationSnapshot.forEach(function(doc){
            latestSpecificationVersion = doc.data().version
        })
        //create object data to create course report document
        obj = {
            section: [sectionRef],
            instructor: instructorUID,
            coordinator: coordinatorUID,
            location: location,
            courseCode: courseCode,
            year: calender.year,
            term: calender.term,
            specificationVersion: latestSpecificationVersion,
            status: 'new',
            sentStatus: false
        }
        //create course rpeort document
        createDoc(g_courseReportCollRef, obj)
        .then(() => {
            g_createButton.removeAttribute('disabled')
            alert('success')
        })
        .catch((err) => {
            g_createButton.removeAttribute('disabled')
            alert('Failed, error: ' + err)
        })
    }
})