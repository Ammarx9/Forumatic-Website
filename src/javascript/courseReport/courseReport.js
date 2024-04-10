import { startFirebaseApp, getFirestoreDB } from './util/firestoreApp'
import { getCollection } from './util/collection'
import {
    getDocDataArrayByRef,
    getDocRefById,
    getDocByRef,
    getDocDataByRef,
    createQuery,
    getDocQuery,
    updateDocByRef
} from './util/document'
import { generateRowOfInputs, generateRowOfTextareas, generateRowOfParagraphs, generateRowOfArbitraryElements } from './util/rowGenerator'
import { getDate } from './util/calender'
import { readRowsOfInputs, readRowsOfArbitraryElements } from './util/rowReader'
import { filterNonHTMLElements } from './util/filter'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { sendTotGPT } from './util/ChatGPT'
const Papa = require("papaparse");
import { updateDoc } from 'firebase/firestore';
//------------------------------------------------------
//--------------preparing elements values---------------
//------------------------------------------------------
const t_clo = filterNonHTMLElements(document.getElementById('T_CLO').childNodes)[1]
const r_knowledge = document.getElementById('T_CLOKnowledge')
const r_skill = document.getElementById('T_CLOSkill')
const r_value = document.getElementById('T_CLOValue')
const t_topicsNotCovered = filterNonHTMLElements(document.getElementById('T_topicsNotCovered').childNodes)[0]
const r_topicsNotCoveredButton = document.getElementById('R_topicsNotCoveredButton')
const b_topicsNotCovered = document.getElementById('B_topics_not_covered_row_adder')
const b_topicsNotCoveredRemover = document.getElementById('B_topics_not_covered_row_remover')
const t_courseImprovments = document.getElementById('T_courseImprovments').childNodes[1]
const r_courseImprovmentsButton = document.getElementById('R_courseImprovmentsButton')
const b_courseImprovments = document.getElementById('B_course_improvment_row_adder')
const b_courseImprovmentsRemover = document.getElementById('B_course_improvment_row_remover')
const b_save = document.getElementById('B_save')
const b_exportReport = document.getElementById('B_exportReport')
const b_generateGradeComment = document.getElementById('B_generateGradeComment')
const b_generateCLOComment = document.getElementById('B_generateCLOComment')
const b_generateRecommendations = document.getElementById('B_generateRecommendationsComment')
b_topicsNotCovered.setAttribute('disabled', 'disabled')
b_courseImprovments.setAttribute('disabled', 'disabled')
b_save.setAttribute('disabled', 'disabled')
b_exportReport.setAttribute('disabled', 'disabled')
b_generateGradeComment.setAttribute('disabled', 'disabled')
b_generateCLOComment.setAttribute('disabled', 'disabled')
b_generateRecommendations.setAttribute('disabled', 'disabled')
//------------------------------------------------------
//---------------finished elements values---------------
//------------------------------------------------------
//------------------------------------------------------
//---------------starting preparing data----------------
//------------------------------------------------------
console.log("preparing data")
//start firebase app
const g_app = startFirebaseApp()
//start firestore connection
const g_db = await getFirestoreDB()
//start auth object
const g_auth = await getAuth(g_app)
let g_user
onAuthStateChanged(g_auth, (user) => {
  if(user){
    g_user = user
    let login = document.getElementById('N_login')
    login.removeAttribute('href')
    login.innerHTML = "Log out"
    login.addEventListener('click', function(handle){
      g_auth.signOut()
      window.location.href = "./index.html?ste=logout"
    })
  }else{
    window.location.href = "./index.html?ste=not"
  }
})
//get doc id from URL params
const g_urlParams = new URLSearchParams(window.location.search);
const g_docID = g_urlParams.get('id');
if(!g_docID){
    throw new Error('URL variable (ID) is undefined.')
}
//get course report, course specification, instructor and coordinator collection references
const g_courseReportCollRef = await getCollection(g_db, 'courseReport')
const g_courseSpecificationCollRef = await getCollection(g_db, 'courseSpecification')
const g_instructorCollRef = await getCollection(g_db, 'instructor')
const g_coordinatorCollRef = await getCollection(g_db, 'coordinator')
//get course report document reference
const g_courseReportDocRef = await getDocRefById(g_courseReportCollRef, g_docID)
//check if reference is valid
if(!g_courseReportDocRef){
    throw new Error('please make sure you enter the correct document id in URL params.')
}
//get course report document and it's data
const g_courseReportDoc = await getDocByRef(g_courseReportDocRef)
const g_courseReportData = g_courseReportDoc.data()
//preapre instructor and coordinator references
const g_instructorRef = await getDocRefById(g_instructorCollRef, g_courseReportData.instructor)
const g_coordinatorRef = await getDocRefById(g_coordinatorCollRef, g_courseReportData.coordinator)
//get instructor and coordinator data
const g_instructorData = await getDocDataByRef(g_instructorRef)
const g_coordinatorData = await getDocDataByRef(g_coordinatorRef)
//get section reference array
const g_sectionsRefArr = g_courseReportData.section
//get data of the first section reference (must be guranteed since it means "section 1")
const g_firstSectionData = await getDocDataByRef(g_sectionsRefArr[0])
let g_registerStudents = g_firstSectionData.registeredStudents
for(let i = 1; i < g_sectionsRefArr.length; i++){
    g_registerStudents = g_registerStudents + (await getDocDataByRef(g_registerStudents[i])).registeredStudents
}
//prepare course specification query
const query = createQuery(g_courseSpecificationCollRef, ['courseCode', '==', g_firstSectionData.courseCode
,'version', '==', g_courseReportData.specificationVersion])
let g_courseSpecificationData
//get course specification snapshot
const g_courseSpecificationSnapshot = await getDocQuery(query)
g_courseSpecificationSnapshot.forEach(function(doc){
    g_courseSpecificationData = doc.data()
    
})
const g_departmentData = await getDocDataByRef(g_courseSpecificationData.department)
const g_collegeData = await getDocDataByRef(g_departmentData.college)
const g_institutionData = await getDocDataByRef(g_collegeData.institution)
//get course report status
const g_reportStatus = g_courseReportData.status
//------------------------------------------------------
//---------------finished preparing data----------------
//------------------------------------------------------
//-------------starting pasting information-------------
//------------------------------------------------------
console.log('pasting')
switch(g_reportStatus){
    case 'new':
        await pastNewDocument()
        await newCLO()
        break
    case 'pending':
        await pastNewDocument()
        pastePendingDocument()
        await pendingCLO()
        break
    case 'completed':
        await pastNewDocument()
        pastePendingDocument()
        await pendingCLO()
        break
}
function pastePendingDocument(){
    document.getElementById('I_Completed_student').value = g_courseReportData.completedStudents
    document.getElementById('I_report_date').value = g_courseReportData.reportDate
    const aPlus = Number(g_courseReportData.gradeDistribution.highA)
    const a = Number(g_courseReportData.gradeDistribution.A)
    const bPlus = Number(g_courseReportData.gradeDistribution.highB)
    const b = Number(g_courseReportData.gradeDistribution.B)
    const cPlus = Number(g_courseReportData.gradeDistribution.highC)
    const c = Number(g_courseReportData.gradeDistribution.C)
    const dPlus = Number(g_courseReportData.gradeDistribution.highD)
    const d = Number(g_courseReportData.gradeDistribution.D)
    const f = Number(g_courseReportData.gradeDistribution.F)
    const denied = Number(g_courseReportData.gradeDistribution.denied)
    const inProgress = Number(g_courseReportData.gradeDistribution.inProgress)
    const incomplete = Number(g_courseReportData.gradeDistribution.incomplete)
    const pass = Number(g_courseReportData.gradeDistribution.pass)
    const fail = Number(g_courseReportData.gradeDistribution.fail)
    const withdrawn = Number(g_courseReportData.gradeDistribution.withdrawn)
    let grades = {
      high_a: aPlus,
      a: a,
      high_b: bPlus,
      b: b,
      high_c: cPlus,
      c: c,
      high_d: dPlus,
      d: d,
      f: f,
      denied: denied,
      in_progress: inProgress,
      incomplete: incomplete,
    //   pass: pass,
    //   fail: fail,
      withdrawn: withdrawn,
    };
    const total = Object.values(grades).reduce((sum, value) => sum + value, 0)
    document.getElementById('I_grade_a_plus').value = aPlus
    document.getElementById('I_grade_a').value = a
    document.getElementById('I_grade_b_plus').value = bPlus
    document.getElementById('I_grade_b').value = b
    document.getElementById('I_grade_c_plus').value = cPlus
    document.getElementById('I_grade_c').value = c
    document.getElementById('I_grade_d_plus').value = dPlus
    document.getElementById('I_grade_d').value = d
    document.getElementById('I_grade_f').value = f
    document.getElementById('I_grade_denied_entry').value = denied
    document.getElementById('I_grade_in_progress').value = inProgress
    document.getElementById('I_grade_incomplete').value = incomplete
    document.getElementById('I_grade_pass').value = pass
    document.getElementById('I_grade_fail').value = fail
    document.getElementById('I_grade_withdrawn').value = withdrawn
    document.getElementById('I_grade-a_plus_Percentage').value = Math.floor((aPlus / total) * 100)
    document.getElementById('I_grade-a_Percentage').value = Math.floor((a / total) * 100)
    document.getElementById('I_grade-b_plus_Percentage').value = Math.floor((bPlus / total) * 100)
    document.getElementById('I_grade-b_Percentage').value = Math.floor((b / total) * 100)
    document.getElementById('I_grade-c_plus_Percentage').value = Math.floor((cPlus / total) * 100)
    document.getElementById('I_grade-c_Percentage').value = Math.floor((c / total) * 100)
    document.getElementById('I_grade-d_plus_Percentage').value = Math.floor((dPlus / total) * 100)
    document.getElementById('I_grade-d_Percentage').value = Math.floor((d / total) * 100)
    document.getElementById('I_grade-f_Percentage').value = Math.floor((f / total) * 100)
    document.getElementById('I_grade_denied_entry_Percentage').value = Math.floor((denied / total) * 100)
    document.getElementById('I_grade_in_progress_Percentage').value = Math.floor((inProgress / total) * 100)
    document.getElementById('I_grade_incomplete_Percentage').value = Math.floor((incomplete / total) * 100)
    document.getElementById('I_grade_pass_Percentage').value = Math.floor((pass / total) * 100)
    document.getElementById('I_grade_fail_Percentage').value = Math.floor((fail / total) * 100)
    document.getElementById('I_grade_withdrawn_Percentage').value = Math.floor((withdrawn / total) * 100)
    document.getElementById('I_grade_comment').value = g_courseReportData.gradeComment
    document.getElementById('I_recommandations').value = g_courseReportData.recommendations
    const topicsNotCovered = g_courseReportData.topicsNotCovered
    for(let i = 0; i < topicsNotCovered.length; i++){
        const values =
        [topicsNotCovered[i].topic
        ,topicsNotCovered[i].reason
        ,topicsNotCovered[i].impact
        ,topicsNotCovered[i].action]
        const row = generateRowOfTextareas(values)
        t_topicsNotCovered.insertBefore(row, r_topicsNotCoveredButton)
    }
    //course improvments
    const v = filterNonHTMLElements(document.getElementById('T_courseImprovments').childNodes)
    const T_courseImprovments = filterNonHTMLElements(document.getElementById('T_courseImprovments').childNodes)[0]
    const courseImprovments = g_courseReportData.courseImprovments
    for(let i = 0; i < courseImprovments.length; i++){
        const values =
        [courseImprovments[i].recommendation
        ,courseImprovments[i].action
        ,courseImprovments[i].neededSupport]
        const row = generateRowOfTextareas(values)
        T_courseImprovments.insertBefore(row, r_courseImprovmentsButton)
    }
}
//this function will past document data except:
//1- general info: completed students and report date.
//2- grades and grade comment
//3- topics not covered
//4- course improvments plan
//5- CLO: actual level and comment
async function pastNewDocument(){
    document.getElementById('I_course_title').value = g_courseSpecificationData.courseTitle
    document.getElementById('I_course_code').value = g_courseSpecificationData.courseCode
    document.getElementById('I_department').value = g_departmentData.name
    document.getElementById('I_program').value = g_courseSpecificationData.program
    document.getElementById('I_college').value = g_collegeData.name
    document.getElementById('I_institution').value = g_institutionData.name
    document.getElementById('I_academic_year').value = g_courseReportData.year
    document.getElementById('I_semester').value = g_courseReportData.term
    document.getElementById('I_course_instructor').value = g_instructorData.name
    document.getElementById('I_course_coordinator').value = g_coordinatorData.name
    const l_location = g_courseReportData.location
    if(l_location == 'Branch'){
        document.querySelector('input[name="R_Location"][id="Branch"]').checked = true
    }else{
        document.querySelector('input[name="R_Location"][id="Main campus"]').checked = true
    }
    document.getElementById('I_number_of_section').value = g_sectionsRefArr.length
    document.getElementById('I_number_of_section').value = g_firstSectionData.term
    document.getElementById('I_starting_student').value = g_registerStudents
}
//only pastes CLO values from course specification since comments are still yeat to be saved.
async function newCLO(){
    let CLOKnowledge = []
    let CLOSkill = []
    let CLOValue = []
    if(!g_courseSpecificationData.CLOs){
        return
    }
    const clo = g_courseSpecificationData.CLOs
    const cloArr = Array.of(clo)
    console.log(cloArr)
    const CLOsArr = await getDocDataArrayByRef(g_courseSpecificationData.CLOs)
    for(let i = 0; i < CLOsArr.length; i++){
        const type = CLOsArr[i].type

        if(type == 'Knowledge'){
            CLOKnowledge.push(CLOsArr[i])
        }else if(type == 'Skill'){
            CLOSkill.push(CLOsArr[i])
        }else{
            CLOValue.push(CLOsArr[i])
        }
    }
    //populate CLO knowledge row
    const knowledgeRow = document.getElementById('T_CLOKnowledge')
    const knowledge_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)
    const skill_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)
    const value_rowEnd = filterNonHTMLElements(t_clo.childNodes).length-1
    for(let i = 0; i < CLOKnowledge.length; i++){
        const CLOindex = document.createElement('th')
        CLOindex.innerHTML = `1.${i+1}`
        const plo = await getDocDataByRef(CLOKnowledge[i].PLORef)
        const elements = [
          'p',
          'p',
          'p',
          'p',
          'textarea',
          'textarea'
        ]
        const values = 
        [CLOKnowledge[i].learningOutcome
        ,plo.type
        ,CLOKnowledge[i].assessmentMethod
        ,CLOKnowledge[i].targetLevel
        ,''
        ,'']
        const row = generateRowOfArbitraryElements(elements, values)
        row.insertBefore(CLOindex, row.firstChild)
        const children = filterNonHTMLElements(t_clo.childNodes)
        children[children.indexOf(r_knowledge) + i].after(row)
    }
    //populate CLO skill row
    const skillRow = document.getElementById('T_CLOSkill')
    for(let i = 0; i < CLOSkill.length; i++){
        const CLOindex = document.createElement('th')
        CLOindex.innerHTML = `2.${i+1}`
        const plo = await getDocDataByRef(CLOSkill[i].PLORef)
        const elements = [
          'p',
          'p',
          'p',
          'p',
          'textarea',
          'textarea'
        ]
        const values = 
        [CLOKnowledge[i].learningOutcome
        ,plo.type
        ,CLOKnowledge[i].assessmentMethod
        ,CLOKnowledge[i].targetLevel
        ,''
        ,'']
        const row = generateRowOfArbitraryElements(elements, values)
        row.insertBefore(CLOindex, row.firstChild)
        const children = filterNonHTMLElements(t_clo.childNodes)
        children[children.indexOf(r_skill) + i].after(row)
    }
    //populate CLO value row
    const valueRow = document.getElementById('T_CLOValue')
    let lastNode
    for(let i = 0; i < CLOValue.length; i++){
        const CLOindex = document.createElement('th')
        CLOindex.innerHTML = `3.${i+1}`
        const plo = await getDocDataByRef(CLOValue[i].PLORef)
        const elements = [
          'p',
          'p',
          'p',
          'p',
          'textarea',
          'textarea'
        ]
        const values = 
        [CLOKnowledge[i].learningOutcome
        ,plo.type
        ,CLOKnowledge[i].assessmentMethod
        ,CLOKnowledge[i].targetLevel
        ,''
        ,'']
        const row = generateRowOfArbitraryElements(elements, values)
        row.insertBefore(CLOindex, row.firstChild)
        const children = filterNonHTMLElements(t_clo.childNodes)
        children[children.indexOf(r_value) + i].after(row)
    }
}
//will past CLO values from course speicification and comments for their respective indexes.
//still need to finish
async function pendingCLO(){
    const CLOKnowledge = []
    const CLOSkill = []
    const CLOValue = []
    console.log(g_courseSpecificationData.CLOs)
    const CLOsArr = await getDocDataArrayByRef(g_courseSpecificationData.CLOs)
    for(let i = 0; i < CLOsArr.length; i++){
        const type = CLOsArr[i].type

        if(type == 'Knowledge'){
            CLOKnowledge.push(CLOsArr[i])
        }else if(type == 'Skill'){
            CLOSkill.push(CLOsArr[i])
        }else{
            CLOValue.push(CLOsArr[i])
        }
    }
    //populate CLO knowledge row
    const knowledgeRow = document.getElementById('T_CLOKnowledge')
    const knowledge_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)
    const skill_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)
    const value_rowEnd = filterNonHTMLElements(t_clo.childNodes).length-1
    let cloCounter = 0
    for(let i = 0; i < CLOKnowledge.length; i++){
        const CLOindex = document.createElement('th')
        CLOindex.innerHTML = `1.${i+1}`
        const plo = await getDocDataByRef(CLOKnowledge[i].PLORef)
        const elements = [
          'p',
          'p',
          'p',
          'p',
          'textarea',
          'textarea'
        ]
        const values = 
        [CLOKnowledge[i].learningOutcome
        ,plo.type
        ,CLOKnowledge[i].assessmentMethod
        ,CLOKnowledge[i].targetLevel
        ,g_courseReportData.CLOReport.actualLevel[cloCounter]
        ,g_courseReportData.CLOReport.assessmentComment[cloCounter]]
        const row = generateRowOfArbitraryElements(elements, values)
        row.insertBefore(CLOindex, row.firstChild)
        const children = filterNonHTMLElements(t_clo.childNodes)
        children[children.indexOf(r_knowledge) + i].after(row)
        cloCounter++
    }
    //populate CLO skill row
    const skillRow = document.getElementById('T_CLOSkill')
    for(let i = 0; i < CLOSkill.length; i++){
        const CLOindex = document.createElement('th')
        CLOindex.innerHTML = `2.${i+1}`
        const plo = await getDocDataByRef(CLOSkill[i].PLORef)
        const elements = [
          'p',
          'p',
          'p',
          'p',
          'textarea',
          'textarea'
        ]
        const values = 
        [CLOSkill[i].learningOutcome
        ,plo.type
        ,CLOSkill[i].assessmentMethod
        ,CLOSkill[i].targetLevel
        ,g_courseReportData.CLOReport.actualLevel[cloCounter]
        ,g_courseReportData.CLOReport.assessmentComment[cloCounter]]
        const row = generateRowOfArbitraryElements(elements, values)
        row.insertBefore(CLOindex, row.firstChild)
        const children = filterNonHTMLElements(t_clo.childNodes)
        children[children.indexOf(r_skill) + i].after(row)
        cloCounter++
    }
    //populate CLO value row
    const valueRow = document.getElementById('T_CLOValue')
    for(let i = 0; i < CLOValue.length; i++){
        const CLOindex = document.createElement('th')
        CLOindex.innerHTML = `3.${i+1}`
        const plo = await getDocDataByRef(CLOValue[i].PLORef)
        const elements = [
          'p',
          'p',
          'p',
          'p',
          'textarea',
          'textarea'
        ]
        const values = 
        [CLOValue[i].learningOutcome
        ,plo.type
        ,CLOValue[i].assessmentMethod
        ,CLOValue[i].targetLevel
        ,g_courseReportData.CLOReport.actualLevel[cloCounter]
        ,g_courseReportData.CLOReport.assessmentComment[cloCounter]]
        const row = generateRowOfArbitraryElements(elements, values)
        row.insertBefore(CLOindex, row.firstChild)
        const children = filterNonHTMLElements(t_clo.childNodes)
        children[children.indexOf(r_value) + i].after(row)
        cloCounter++
    }
}
//------------------------------------------------------
//----------------finished pasting data-----------------
//------------------------------------------------------
//--------------starting adding listeners---------------
//------------------------------------------------------
b_topicsNotCovered.addEventListener('click', function(handle){
    //the goal here is to create a row with these elements:
    //[input[type="text"], input[type="text"], input[type="text"], input[type="text"]]
    const value = ['', '', '', '']
    const row = generateRowOfTextareas(value)
    t_topicsNotCovered.insertBefore(row, r_topicsNotCoveredButton)
})
b_topicsNotCoveredRemover.addEventListener('click', function(handle){
  const index = filterNonHTMLElements(t_topicsNotCovered.childNodes).indexOf(r_topicsNotCoveredButton)
  if(!(index-1)) return
  t_topicsNotCovered.removeChild(filterNonHTMLElements(t_topicsNotCovered.childNodes)[index-1])
})
b_topicsNotCovered.removeAttribute('disabled')
b_courseImprovments.addEventListener('click', function(handle){
    //the goal here is to create a row with these elements:
    //[input[type="text"], input[type="text"], input[type="text"]]
    const value = ['', '', '']
    const row = generateRowOfTextareas(value)
    t_courseImprovments.insertBefore(row, r_courseImprovmentsButton)
})
b_courseImprovments.removeAttribute('disabled')
b_courseImprovmentsRemover.addEventListener('click', function(handle){
  const index = filterNonHTMLElements(t_courseImprovments.childNodes).indexOf(r_courseImprovmentsButton)
  if(!(index-1)) return
  t_courseImprovments.removeChild(filterNonHTMLElements(t_courseImprovments.childNodes)[index-1])
})
b_save.addEventListener('click', function(){
  b_save_rep("sav")
})
async function b_save_rep(from){
    let docJson = {
        gradeDistribution: {
            highA: Number(document.getElementById('I_grade_a_plus').value),
            A: Number(document.getElementById('I_grade_a').value),
            highB: Number(document.getElementById('I_grade_b_plus').value),
            B: Number(document.getElementById('I_grade_b').value),
            highC: Number(document.getElementById('I_grade_c_plus').value),
            C: Number(document.getElementById('I_grade_c').value),
            highD: Number(document.getElementById('I_grade_d_plus').value),
            D: Number(document.getElementById('I_grade_d').value),
            F: Number(document.getElementById('I_grade_f').value),
            denied: Number(document.getElementById('I_grade_denied_entry').value),
            inProgress: Number(document.getElementById('I_grade_in_progress').value),
            incomplete: Number(document.getElementById('I_grade_incomplete').value),
            pass: Number(document.getElementById('I_grade_pass').value),
            fail: Number(document.getElementById('I_grade_fail').value),
            withdrawn: Number(document.getElementById('I_grade_withdrawn').value)
        },
        gradeComment: document.getElementById('I_grade_comment').value,
        recommendations: document.getElementById('I_recommandations').value,
        completedStudents: Number(document.getElementById('I_Completed_student').value),
        reportDate: getDate(),
        location: document.querySelector(`input[name="R_Location"]:checked`).value,
        status: 'pending'
    }
    //get data from dynamic table "topics not covered"
    const topics_names = ['topic', 'reason', 'impact', 'action']
    const topics_rowEnd = filterNonHTMLElements(t_topicsNotCovered.childNodes)
    const topics = readRowsOfInputs(t_topicsNotCovered, topics_names, 1, topics_rowEnd.length-1)
    docJson.topicsNotCovered = topics
    //get data from dynamic table "course improvments plan"
    const improvments_name = ['recommendation', 'action', 'neededSupport']
    const improvments_rowEnd = filterNonHTMLElements(t_courseImprovments.childNodes)
    const improvments = readRowsOfInputs(t_courseImprovments, improvments_name, 1, improvments_rowEnd.length-1)
    docJson.courseImprovments = improvments
    const clo_name = [
        'outcome',
        'PLOCode',
        'assessmentMethod',
        'targetLevel',
        'actualLevel',
        'comment'
    ]
    const knowledge_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)
    const skill_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)
    const value_rowEnd = filterNonHTMLElements(t_clo.childNodes).length
    const knowledge = readRowsOfArbitraryElements(t_clo, clo_name, 1, knowledge_rowEnd, 1)
    const skill = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)+1, skill_rowEnd, 1)
    const value = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)+1, value_rowEnd, 1)
    const cloObj = {
        actualLevel: [],
        assessmentComment: []
    }
    for(let i = 0; i < knowledge.length; i++){
        cloObj.actualLevel.push(knowledge[i].actualLevel)
        cloObj.assessmentComment.push(knowledge[i].comment)
    }
    for(let i = 0; i < skill.length; i++){
        cloObj.actualLevel.push(skill[i].actualLevel)
        cloObj.assessmentComment.push(skill[i].comment)
    }
    for(let i = 0; i < value.length; i++){
        cloObj.actualLevel.push(value[i].actualLevel)
        cloObj.assessmentComment.push(value[i].comment)
    }
    docJson.CLOReport = cloObj
    await updateDocByRef(g_courseReportDocRef, docJson)
    .catch((err) => {
        alert('failed, error: ' + err)
    })
    if(from == "sav"){
      window.location.href = './savedReports.html?ste=sav';
    }
}
b_save.removeAttribute('disabled')
b_exportReport.addEventListener('click', export_report_api)
b_exportReport.removeAttribute('disabled')
const emailListContainer = document.getElementById('email-list-container');
const emailInputContainer = document.getElementById('email-input-container');
const emailInput = document.getElementById('email');
const addEmailButton = document.getElementById('add-email-button');
const addButton = document.getElementById('add-button');
const closeButton = document.getElementById('close-button');
const emails = [];
addEmailButton.addEventListener('click', function(handle) {
  showEmailInput();
});
addButton.addEventListener('click', function(handle) {
  addEmail();
  console.log(emails)
});
closeButton.addEventListener('click', function(handle) {
  hideEmailInput();
});
emailListContainer.addEventListener('click', function(event) {
  const deleteButton = event.target.closest('.delete-button');
  if (deleteButton) {
    const email = deleteButton.dataset.email;
    deleteEmail(email);
    console.log(emails)
  }
});
function showEmailInput() {
  emailInputContainer.style.display = 'flex';
  addEmailButton.style.display = 'none';
}
function hideEmailInput() {
  emailInputContainer.style.display = 'none';
  addEmailButton.style.display = 'inline-block';
}
function addEmail() {
  const email = emailInput.value;

  if (/^\S+@\S+\.\S+$/.test(email)) {
    emails.push(email);

    const emailItem = document.createElement('div');
    emailItem.className = 'email-item';
    emailItem.innerHTML = `
      <span>${email}</span>
      <span class="delete-button" data-email="${email}">Delete</span>
    `;

    emailListContainer.appendChild(emailItem);
    emailInput.value = '';

    // Display the email list container when an email is added
    emailListContainer.style.display = 'block';

    // Hide the email input field and buttons after adding an email
    hideEmailInput();
  } else {
    alert('Please enter a valid email address.');
  }
}
function deleteEmail(email) {
  const index = emails.indexOf(email);
  if (index !== -1) {
    emails.splice(index, 1);
  }

  // Remove the email item from the DOM
  const emailItem = document.querySelector(`[data-email="${email}"]`);
  if (emailItem) {
    emailListContainer.removeChild(emailItem.parentNode);
  }

  // Hide the email list container if there are no emails
  if (emails.length === 0) {
    emailListContainer.style.display = 'none';
  }
}
async function  export_report_api (){
  b_save_rep("exo")
  // will get the emil of the the department
  let dep_em = await getDocDataByRef(g_courseSpecificationData.department)

  emails.push(dep_em.email)
    let corse_name = document.getElementById("I_course_title").value
    let year = document.getElementById("I_academic_year").value
    let term = document.getElementById("I_semester").value
    let uid = g_user.uid
   
    let course_reprt_file = corse_name + "_year" + year + "_term" + term + "_uid" + uid;
    //  Check if 'file_name' is not null and exists
    let zip_file
    if (g_courseReportData.file_name) {
      zip_file = g_courseReportData.file_name;
      // 'file_name' exists and is not null
      console.log('Value of course_spc_name:', zip_file);
    } else {
      // 'file_name' is null or doesn't exist
      zip_file = 'none';
      console.log('Value of course_spc_name:', zip_file);
    }
    console.log("course_spc_name is::::",zip_file)
    let email_list = emails
    let dr = document.getElementById("I_course_instructor").value
    
    try{
        
        const word = await word_gen(course_reprt_file)
        console.log("word api is good and have ::",word)

        const zip = await zip_gen(zip_file, course_reprt_file)
        console.log("zip api is good and have :: ", zip)

        const email_send = await send_email(course_reprt_file, email_list,dr)
        console.log("email api is good and have ::", email_send)

        await updateDoc(g_courseReportDocRef, {
            sentStatus: true
            
          });

        window.location.href = './index.html?ste=exo';
    }
    catch(err){
        console.error('Error:', err);
    }
}
async function word_gen(course_reprt_file){
    

    // this code will make obj that take all report data
    let json_data = json_api(course_reprt_file)
    try {
        const response = await fetch("https://europe-north1-formal-scout-411021.cloudfunctions.net/gen_word", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
          },
          body: JSON.stringify(json_data),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const jsonResponse = await response.json();
        // Process jsonResponse as needed
        return jsonResponse
      } catch (error) {
        console.error('Error:', error);
      }

}

async function zip_gen(zip_file,file_name){
    let json = {
        file_name : file_name,
        zip_file : zip_file

    }

    try {
        const response = await fetch("https://europe-north1-formal-scout-411021.cloudfunctions.net/zip_file", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
          },
          body: JSON.stringify(json),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const jsonResponse = await response.json();
        // Process jsonResponse as needed
        return jsonResponse
      } catch (error) {
        console.error('Error:', error);
      }
    
}
async function send_email(file_name,emails,dr){
    let json = {
        file_name : file_name,
        emails : emails,
        dr : dr
    }

    try {
        const response = await fetch("https://europe-north1-formal-scout-411021.cloudfunctions.net/send_email2", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
          },
          body: JSON.stringify(json),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const jsonResponse = await response.json();
        // Process jsonResponse as needed
        return jsonResponse
      } catch (error) {
        console.error('Error:', error);
        return response.json();
      }
    
}
function json_api(file_name){

    /**@type {Number} */
    let totalStudents = g_courseReportData.gradeDistribution.highA
    + g_courseReportData.gradeDistribution.A
    + g_courseReportData.gradeDistribution.highB
    + g_courseReportData.gradeDistribution.B
    + g_courseReportData.gradeDistribution.highC
    + g_courseReportData.gradeDistribution.C
    + g_courseReportData.gradeDistribution.highD
    + g_courseReportData.gradeDistribution.D
    + g_courseReportData.gradeDistribution.F
    + g_courseReportData.gradeDistribution.denied
    + g_courseReportData.gradeDistribution.inProgress
    + g_courseReportData.gradeDistribution.incomplete
    + g_courseReportData.gradeDistribution.pass
    + g_courseReportData.gradeDistribution.fail
    + g_courseReportData.gradeDistribution.withdrawn;

    /**
     * @type {import('./util/constants').info_python_courseReportObj}
     */
    let docxJson = {}
    docxJson.file_name = file_name
    docxJson.course_title = document.getElementById('I_course_title').value
    docxJson.course_code = document.getElementById('I_course_code').value
    docxJson.department = document.getElementById('I_department').value
    docxJson.program = document.getElementById('I_program').value
    docxJson.college = document.getElementById('I_college').value
    docxJson.institution = document.getElementById('I_institution').value
    docxJson.academic_year = document.getElementById('I_academic_year').value
    docxJson.semester = document.getElementById('I_semester').value
    docxJson.course_instructor = document.getElementById('I_course_instructor').value
    docxJson.course_coordinator = document.getElementById('I_course_coordinator').value
    docxJson.loc = document.querySelector(`input[type="radio"][name="R_Location"]:checked`).value
    docxJson.section_num = document.getElementById('I_number_of_section').value
    docxJson.students_str = document.getElementById('I_starting_student').value
    docxJson.students_coml = document.getElementById('I_Completed_student').value

    docxJson.report_date = document.getElementById('I_report_date').value
    docxJson.ap = Number(document.getElementById('I_grade_a_plus').value)
    docxJson.a = Number(document.getElementById('I_grade_a').value)
    docxJson.bp = Number(document.getElementById('I_grade_b_plus').value)
    docxJson.b = Number(document.getElementById('I_grade_b').value)
    docxJson.cp = Number(document.getElementById('I_grade_c_plus').value)
    docxJson.c = Number(document.getElementById('I_grade_c').value)
    docxJson.dp = Number(document.getElementById('I_grade_d_plus').value)
    docxJson.d = Number(document.getElementById('I_grade_d').value)
    docxJson.f = Number(document.getElementById('I_grade_f').value)
    docxJson.dn = Number(document.getElementById('I_grade_denied_entry').value)
    docxJson.ip = Number(document.getElementById('I_grade_in_progress').value)
    docxJson.ic = Number(document.getElementById('I_grade_incomplete').value)
    docxJson.pass = Number(document.getElementById('I_grade_pass').value)
    docxJson.fail = Number(document.getElementById('I_grade_fail').value)
    docxJson.w = Number(document.getElementById('I_grade_withdrawn').value)

    docxJson.ap_pre = Number(document.getElementById('I_grade-a_plus_Percentage').value)+"%"
    docxJson.a_pre = Number(document.getElementById('I_grade-a_Percentage').value)+"%"
    docxJson.bp_pre = Number(document.getElementById('I_grade-b_plus_Percentage').value)+"%"
    docxJson.b_pre = Number(document.getElementById('I_grade-b_Percentage').value)+"%"
    docxJson.cp_pre = Number(document.getElementById('I_grade-c_plus_Percentage').value)+"%"
    docxJson.c_pre = Number(document.getElementById('I_grade-c_Percentage').value)+"%"
    docxJson.dp_pre = Number(document.getElementById('I_grade-d_plus_Percentage').value)+"%"
    docxJson.d_pre = Number(document.getElementById('I_grade-d_Percentage').value)+"%"
    docxJson.f_pre = Number(document.getElementById('I_grade-f_Percentage').value)+"%"
    docxJson.dn_pre = Number(document.getElementById('I_grade_withdrawn').value)+"%"
    docxJson.ip_pre = Number(document.getElementById('I_grade_withdrawn').value)+"%"
    docxJson.ic_pre = Number(document.getElementById('I_grade_withdrawn').value)+"%"
    docxJson.pass_pre = Number(document.getElementById('I_grade_withdrawn').value)+"%"
    docxJson.fail_pre = Number(document.getElementById('I_grade_withdrawn').value)+"%"
    docxJson.w_pre = Number(document.getElementById('I_grade_withdrawn').value)+"%"
    // should not get the vlaue from data base
    docxJson.Grades_comm = document.getElementById("I_grade_comment").value    
    docxJson.Recommendations = document.getElementById("I_recommandations").value

    const clo_name = [
        'outcome',
        'PLOCode',
        'assessmentMethod',
        'targetLevel',
        'actualLevel',
        'comment'
    ]
    
    const knowledge_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)
    const skill_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)
    const value_rowEnd = filterNonHTMLElements(t_clo.childNodes).length-1
    /**@type {Array.<import('./util/constants').subInfo_Clo>} */
    const knowledge = readRowsOfArbitraryElements(t_clo, clo_name, 1, knowledge_rowEnd,1)
    const skill = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)+1, skill_rowEnd,1)
    const value = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)+1, value_rowEnd,1)

    /**@type {Array.<import('./util/constants').subInfo_Clo>} */
    let CLOKnowledge = []
    /**@type {Array.<import('./util/constants').subInfo_Clo>} */
    let CLOSkill = []
    /**@type {Array.<import('./util/constants').subInfo_Clo>} */
    let CLOValue = []

    for(let i = 0; i < knowledge.length; i++){
        let obj = {}
        obj.num = `1.${i+1}`
        obj.clo = knowledge[i].outcome
        obj.rd = knowledge[i].PLOCode
        obj.am = knowledge[i].assessmentMethod
        obj.tr = knowledge[i].targetLevel
        obj.al = knowledge[i].actualLevel
        obj.com = knowledge[i].comment
        CLOKnowledge.push(obj)
    }

    for(let i = 0; i < skill.length; i++){
        let obj = {}
        obj.num = `2.${i+1}`
        obj.clo = skill[i].outcome
        obj.rd = skill[i].PLOCode
        obj.am = skill[i].assessmentMethod
        obj.tr = skill[i].targetLevel
        obj.al = skill[i].actualLevel
        obj.com = skill[i].comment
        CLOSkill.push(obj)
    }

    for(let i = 0; i < value.length; i++){
        let obj = {}
        obj.num = `3.${i+1}`
        obj.clo = value[i].outcome
        obj.rd = value[i].PLOCode
        obj.am = value[i].assessmentMethod
        obj.tr = value[i].targetLevel
        obj.al = value[i].actualLevel
        obj.com = value[i].comment
        CLOValue.push(obj)
    }

    docxJson.clo_1 = CLOKnowledge
    docxJson.clo_2 = CLOSkill
    docxJson.clo_3 = CLOValue

    //get data from dynamic table "topics not covered"
    const topics_names = ['top', 'res', 'ex', 'com']
    const topics_rowEnd = filterNonHTMLElements(t_topicsNotCovered.childNodes)
    const topics = readRowsOfInputs(t_topicsNotCovered, topics_names, 1, topics_rowEnd.length-1)
    
    docxJson.topcs = topics

    //get data from dynamic table "course improvments plan"
    const improvments_name = ['rec', 'ac', 'sup']
    const improvments_rowEnd = filterNonHTMLElements(t_courseImprovments.childNodes)
    const improvments = readRowsOfInputs(t_courseImprovments, improvments_name, 1, improvments_rowEnd.length-1)

    docxJson.course_imp = improvments

    return docxJson

}
b_generateGradeComment.addEventListener('click', async function(handle){
    const obj = {
        grades: {
            highA: Number(document.getElementById('I_grade_a_plus').value),
            A: Number(document.getElementById('I_grade_a').value),
            highB: Number(document.getElementById('I_grade_b_plus').value),
            B: Number(document.getElementById('I_grade_b').value),
            highC: Number(document.getElementById('I_grade_c_plus').value),
            C: Number(document.getElementById('I_grade_c').value),
            highD: Number(document.getElementById('I_grade_d_plus').value),
            D: Number(document.getElementById('I_grade_d').value),
            F: Number(document.getElementById('I_grade_f').value),
            denied: Number(document.getElementById('I_grade_denied_entry').value),
            inProgress: Number(document.getElementById('I_grade_in_progress').value),
            incomplete: Number(document.getElementById('I_grade_incomplete').value),
            pass: Number(document.getElementById('I_grade_pass').value),
            fail: Number(document.getElementById('I_grade_fail').value),
            withdrawn: Number(document.getElementById('I_grade_withdrawn').value)
        }
    }
    
    const message = await sendTotGPT(obj)
    document.getElementById('I_grade_comment').value = message
})
b_generateGradeComment.removeAttribute('disabled')
b_generateCLOComment.addEventListener('click', async function(handle){
    const clo_name = [
        'outcome',
        'PLOCode',
        'assessmentMethod',
        'targetLevel',
        'actualLevel',
        'comment'
    ]
    const knowledge_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)
    const skill_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)
    const value_rowEnd = filterNonHTMLElements(t_clo.childNodes).length
    const knowledge = readRowsOfArbitraryElements(t_clo, clo_name, 1, knowledge_rowEnd, 1)
    const skill = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)+1, skill_rowEnd, 1)
    const value = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)+1, value_rowEnd, 1)
    for(let i = 0; i < knowledge.length; i++){
        const outcome = knowledge[i].outcome
        const targetLevel = knowledge[i].targetLevel
        const actualLevel = knowledge[i].actualLevel
        if(!actualLevel){
            continue
        }
        const obj = {
            courseLearningOutcome: {
                outcome: outcome,
                targetLevel: targetLevel,
                actualLevel: actualLevel
            }
        }
        const message = await sendTotGPT(obj)
        const tableRows = filterNonHTMLElements(t_clo.childNodes)
        const rowCells = filterNonHTMLElements(tableRows[1 + i].childNodes)
        const cellElements = filterNonHTMLElements(rowCells[rowCells.length-1].childNodes)
        cellElements[0].value = message
        await new Promise(r => setTimeout(r, 15000))
    }
    for(let i = 0; i < skill.length; i++){
        const outcome = skill[i].outcome
        const targetLevel = skill[i].targetLevel
        const actualLevel = skill[i].actualLevel
        if(!actualLevel){
            continue
        }
        const obj = {
            courseLearningOutcome: {
                outcome: outcome,
                targetLevel: targetLevel,
                actualLevel: actualLevel
            }
        }
        const message = await sendTotGPT(obj)
        const tableRows = filterNonHTMLElements(t_clo.childNodes)
        const rowCells = filterNonHTMLElements(tableRows[knowledge_rowEnd + 1 + i].childNodes)
        const cellElements = filterNonHTMLElements(rowCells[rowCells.length-1].childNodes)
        cellElements[0].value = message
        await new Promise(r => setTimeout(r, 15000))
    }
    for(let i = 0; i < value.length; i++){
        const outcome = value[i].outcome
        const targetLevel = value[i].targetLevel
        const actualLevel = value[i].actualLevel
        if(!actualLevel){
            continue
        }
        const obj = {
            courseLearningOutcome: {
                outcome: outcome,
                targetLevel: targetLevel,
                actualLevel: actualLevel
            }
        }
        const message = await sendTotGPT(obj)
        const tableRows = filterNonHTMLElements(t_clo.childNodes)
        const rowCells = filterNonHTMLElements(tableRows[skill_rowEnd + 1 + i].childNodes)
        const cellElements = filterNonHTMLElements(rowCells[rowCells.length-1].childNodes)
        cellElements[0].value = message
        await new Promise(r => setTimeout(r, 15000))
    }
})
b_generateCLOComment.removeAttribute('disabled')
b_generateRecommendations.addEventListener('click', async function(handle){
  const clo_name = [
    'outcome',
    'PLOCode',
    'assessmentMethod',
    'targetLevel',
    'actualLevel',
    'comment'
  ]

  const knowledge_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)
  const skill_rowEnd = Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)
  const value_rowEnd = filterNonHTMLElements(t_clo.childNodes).length
  const knowledge = readRowsOfArbitraryElements(t_clo, clo_name, 1, knowledge_rowEnd, 1)
  const skill = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_skill)+1, skill_rowEnd, 1)
  const value = readRowsOfArbitraryElements(t_clo, clo_name, Array.from(filterNonHTMLElements(t_clo.childNodes)).indexOf(r_value)+1, value_rowEnd, 1)

  const message = {
    knowledge: knowledge,
    skill: skill,
    value: value
  }

  const response = await sendTotGPT(message)

  document.getElementById('I_recommandations').value = response
})
b_generateRecommendations.removeAttribute('disabled')
let csv = document.querySelector("#grade_csv");
csv.addEventListener("change", grade_csv_set);
function grade_percent(grads,pass,fail) {
    // this will give you sum of all
    let total = Object.values(grads).reduce((sum, value) => sum + value, 0);
  
    let high_a = Math.floor((grads.high_a / total) * 100);
    let a = Math.floor((grads.a / total) * 100);
    let high_b = Math.floor((grads.high_b / total) * 100);
    let b = Math.floor((grads.b / total) * 100);
    let high_c = Math.floor((grads.high_c / total) * 100);
    let c = Math.floor((grads.c / total) * 100);
    let high_d = Math.floor((grads.high_d / total) * 100);
    let d = Math.floor((grads.d / total) * 100);
    let f = Math.floor((grads.f / total) * 100);
  
    let denied = Math.floor((grads.denied / total) * 100);
    let in_progress = Math.floor((grads.in_progress / total) * 100);
    let incomplete = Math.floor((grads.incomplete / total) * 100);
    let pass_pre = Math.floor((pass / total) * 100);
    let fail_pre = Math.floor((fail / total) * 100);
    let withdrawn = Math.floor((grads.withdrawn / total) * 100);
  
    document.querySelector("#I_grade-a_plus_Percentage").value = high_a;
  
    document.querySelector("#I_grade-a_Percentage").value = a;
    document.querySelector("#I_grade-b_plus_Percentage").value = high_b;
    document.querySelector("#I_grade-b_Percentage").value = b;
  
    document.querySelector("#I_grade-c_plus_Percentage").value = high_c;
    document.querySelector("#I_grade-c_Percentage").value = c;
  
    document.querySelector("#I_grade-d_plus_Percentage").value = high_d;
    document.querySelector("#I_grade-d_Percentage").value = d;
  
    document.querySelector("#I_grade-f_Percentage").value = f;
}
function grade_csv_set() {
  // let csv = document.querySelector("#grade_csv");
  if (csv.files && csv.files.length > 0) {
    Papa.parse(csv.files[0], {
      header: true,
      // any line is emty will not be here
      skipEmptyLines: true,
      //  after we order the data we can use them now like json
      complete: function (csv_data) {
        console.log("first cav data ::", csv_data.meta.fields[0]);
        console.log("sec cav data ::", csv_data.meta.fields[1]);
        console.log("num 3 cav data ::", csv_data.meta.fields[2]);

        if (
          csv_data.meta.fields[0] !== "last_name" ||
          csv_data.meta.fields[1] !== "first_name" ||
          csv_data.meta.fields[2] !== "total"
        ) {
          alert("Columns do not match the expected order");
          return;
        }
        console.log(
          csv_data.data[7].total,
          "and the type is ::",
          typeof csv_data.data[7].total
        );

        console.log(csv_data);
        let a_plus = 0;
        let a = 0;
        let b_plus = 0;
        let b = 0;
        let c_plus = 0;
        let c = 0;
        let d_plus = 0;
        let d = 0;
        let f = 0;
        // dn
        let denied = 0;
        // ip
        let in_progress = 0;
        // ic
        let incomplete = 0;

        let pass = 0;

        let fail = 0;

        //    w
        let withdrawn = 0;

        //   loop to see many stundent get A+ and so on
        for (let i = 0; i < csv_data.data.length; i++) {
          if (csv_data.data[i].total >= 95) {
            a_plus++;
          } else if (
            csv_data.data[i].total >= 90 &&
            csv_data.data[i].total < 95
          ) {
            a++;
          } else if (
            csv_data.data[i].total >= 85 &&
            csv_data.data[i].total < 90
          ) {
            b++;
          } else if (
            csv_data.data[i].total >= 80 &&
            csv_data.data[i].total < 85
          ) {
            b++;
          } else if (
            csv_data.data[i].total >= 75 &&
            csv_data.data[i].total < 80
          ) {
            c_plus++;
          } else if (
            csv_data.data[i].total >= 70 &&
            csv_data.data[i].total < 75
          ) {
            c++;
          } else if (
            csv_data.data[i].total >= 65 &&
            csv_data.data[i].total < 70
          ) {
            d_plus++;
          } else if (
            csv_data.data[i].total >= 60 &&
            csv_data.data[i].total < 65
          ) {
            d++;
          } else if (csv_data.data[i].total == "w") {
            withdrawn++;
          } else if (csv_data.data[i].total == "ic") {
            incomplete++;
          } else if (csv_data.data[i].total == "ip") {
            in_progress++;
          } else if (csv_data.data[i].total == "dn") {
            denied++;
          } else {
            f++;
          }
        }
        console.log(withdrawn)
        document.querySelector("#I_starting_student").value = csv_data.data.length

        document.querySelector("#I_Completed_student").value = a_plus+a+b_plus+b+c_plus+c+d+d_plus

        document.querySelector("#I_grade_withdrawn").value = withdrawn;
        document.querySelector("#I_grade_incomplete").value = incomplete;
        document.querySelector("#I_grade_in_progress").value = in_progress;
        document.querySelector("#I_grade_denied_entry").value = denied;

        document.querySelector("#I_grade_a_plus").value = a_plus;

        document.querySelector("#I_grade_a").value = a;
        document.querySelector("#I_grade_b_plus").value = b_plus;
        document.querySelector("#I_grade_b").value = b;

        document.querySelector("#I_grade_c_plus").value = c_plus;
        document.querySelector("#I_grade_c").value = c;

        document.querySelector("#I_grade_d_plus").value = d_plus;
        document.querySelector("#I_grade_d").value = d;

        document.querySelector("#I_grade_f").value = f;

        document.querySelector("#I_grade_pass").value = a_plus+a+b_plus+b+c_plus+c+d+d_plus;

        document.querySelector("#I_grade_fail").value = f+denied;

        let grades = {
          high_a: a_plus,
          a: a,
          high_b: b_plus,
          b: b,
          high_c: c_plus,
          c: c,
          high_d: d_plus,
          d: d,
          f: f,
          denied: denied,
          in_progress: in_progress,
          incomplete: incomplete,
        //   pass: pass,
        //   fail: fail,
          withdrawn: withdrawn,
        };

        grade_percent(grades,pass,fail);
      },
    });
  }
}