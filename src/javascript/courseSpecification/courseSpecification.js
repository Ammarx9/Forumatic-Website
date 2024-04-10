import { startFirebaseApp, getFirestoreDB } from './util/firestoreApp'
import { getCollection } from './util/collection'
import { getDocDataArrayByRef, getDocRefById, getDocByRef, getDocDataByRef, createQuery, getDocQuery, updateDocByID } from './util/document'
import { generateRowOfInputs, generateRowOfTextareas } from './util/rowGenerator'
import { filterNonHTMLElements } from './util/filter'
//start firebase app
const g_app = startFirebaseApp()
//start firestore connection
const g_db = await getFirestoreDB()
//get doc id from URL params
const g_urlParams = new URLSearchParams(window.location.search);
const g_docID = g_urlParams.get('id');
//get course specification collection reference
const g_courseSpecificationCollRef = await getCollection(g_db, 'courseSpecification')
//get course specification document reference
const g_courseSpecificationDocRef = await getDocRefById(g_courseSpecificationCollRef, g_docID)
//check if reference is valid
if(!g_courseSpecificationDocRef){
    throw new Error('please make sure you enter the correct document id in URL params.')
}
//get course specification document and data
const g_courseSpecificationDoc = await getDocByRef(g_courseSpecificationDocRef)
const g_courseSpecificationData = g_courseSpecificationDoc.data()
//get department, college and institution data
let g_departmentData = undefined
let g_collegeData = undefined
let g_institutionData = undefined
//if department data is not Undefined
if(g_courseSpecificationData.department){
    //get department, college and institution data
    g_departmentData = await getDocDataByRef(g_courseSpecificationData.department)
    g_collegeData = await getDocDataByRef(g_departmentData.college)
    g_institutionData = await getDocDataByRef(g_collegeData.institution)
}
//get all preRequisits data
let g_preRequisits = []
//if pre requisits data is not undefined
if(g_courseSpecificationData.preRequisits){

    //get all pre requisits by iterating in the array
    for(let i = 0; i < g_courseSpecificationData.preRequisits.length; i++){
        const data = await getDocDataByRef(g_courseSpecificationData.preRequisits[i])
    
        g_preRequisits.push({
            courseTitle: data.courseTitle,
            courseCode: data.courseCode
        })
    }
}
//get all CLO data
let g_CLOKnowledge = []
let g_CLOSkill = []
let g_CLOValue = []
let CLOsArr = undefined
//if CLOs data is not undefined
if(g_courseSpecificationData.CLOs && g_courseSpecificationData.CLOs.length != 0){
    //get CLO array
    CLOsArr = await getDocDataArrayByRef(g_courseSpecificationData.CLOs)
    //filter CLOs by their type
    for(let i = 0; i < CLOsArr.length; i++){
        const type = CLOsArr[i].type
        if(type == 'knowledge'){//if current CLO is knowledge
            g_CLOKnowledge.push(CLOsArr[i])
        }else if(type == 'skill'){//if current CLO is skill
            g_CLOSkill.push(CLOsArr[i])
        }else{//the last condition for current CLO is value
            g_CLOValue.push(CLOsArr[i])
        }
    }
}
//get course specification status
const g_reportStatus = g_courseSpecificationData.status
//------------------------------------------------------
//---------------finished preparing data----------------
//------------------------------------------------------
//--------------preparing elements values---------------
//------------------------------------------------------
//course content row adder
const t_courseContent = document.getElementById('T_course_content').childNodes[1]//course content table body element
const r_courseContenrButton = document.getElementById('R_courseContentButton')//course content, row of button
const b_courseContent = document.getElementById('B_course_content_row_adder')//row adder button
const t_clo = filterNonHTMLElements(document.getElementById('t_CLO').childNodes)[1]
const r_cloKnowledge = document.getElementById('T_CLOKnowledge')
const r_cloSkill = document.getElementById('T_CLOSkill')
const r_cloValue = document.getElementById('T_CLOValue')
const s_knowledge = document.getElementById('S_knowledge')
const s_skill = document.getElementById('S_skill')
const s_value = document.getElementById('S_value')
const b_createCLOKnowledge = document.getElementById('b_createCLOKnowledge')
let courseContentCounter
if(g_courseSpecificationData.courseContent){
    courseContentCounter = g_courseSpecificationData.courseContent.length
}else{
    courseContentCounter = 1
}
//Student Assessment Activities
const t_assessmentActivities = document.getElementById('T_assessmentActivities').childNodes[1]//Student Assessment table body element
const r_assessmentActivitiesButton = document.getElementById('R_assessmentActivitiesButton')//Student Assessment, row of button
const b_assessmentActivities = document.getElementById('B_student_assessment_activity_row_adder')//row adder button
let assessmentActivitiesCounter
if(g_courseSpecificationData.assessmentActivities){
    assessmentActivitiesCounter = g_courseSpecificationData.assessmentActivities.length
}else{
    assessmentActivitiesCounter = 1
}
//Assessment of Course Quality
const t_assessmentcourseQuality = document.getElementById('T_assessmentCourseQuality').childNodes[1]
const r_assessmentCourseQualityButton = document.getElementById('R_assessmentCourseQuality')
const c_assessmentCourseQuality = document.getElementById('C_assessment_of_quality_cell')
const b_assessmentCourseQuality = document.getElementById('B_assessment_of_quality_row_adder')
const b_save = document.getElementById('B_save')
let assessmentCourseQualityCounter
if(g_courseSpecificationData.assessmentOfCourseQuality){
    if(g_courseSpecificationData.assessmentOfCourseQuality.other){
        if(g_courseSpecificationData.assessmentOfCourseQuality.other.assessor){
            assessmentCourseQualityCounter = g_courseSpecificationData.assessmentOfCourseQuality.other.length
        }else{
            assessmentCourseQualityCounter = 1
        }
    }else{
        assessmentCourseQualityCounter = 1
    }
}else{
    assessmentCourseQualityCounter = 1
}
//------------------------------------------------------
//---------------finished elements values---------------
//------------------------------------------------------
//-------------starting pasting information-------------
//------------------------------------------------------
switch(g_reportStatus){
    case 'new':
        pasteNewDocument()
        break
    
    case 'pending':
        pasteNewDocument()
        pastePendingDocument()
        break
    
    case 'record':
        pasteNewDocument()
        pastePendingDocument()
        break
    
    case 'live':
        pasteNewDocument()
        pastePendingDocument()
        break
}
function pasteNewDocument(){
    document.getElementById('I_Course_Title').value = g_courseSpecificationData.courseTitle
    document.getElementById('I_Course_Code').value = g_courseSpecificationData.courseCode
}
function pastePendingDocument(){
    document.getElementById('I_Program').value = g_courseSpecificationData.program
    //check if department data isn't null
    if(g_departmentData){
        document.getElementById('I_Department').value = g_departmentData.name
        document.getElementById('I_College').value = g_collegeData.name
        document.getElementById('I_Institution').value = g_institutionData.name
    }
    document.getElementById('I_Version').value = g_courseSpecificationData.version
    document.getElementById('I_Last_Revision_Data').value = g_courseSpecificationData.lastRevsionDate
    document.getElementById('I_creadit_hours').value = g_courseSpecificationData.creditHours
    //past course type
    if(g_courseSpecificationData.courseType.a && g_courseSpecificationData.courseType.b){
        document.querySelector(`input[type="radio"][name="I_course_type_a"][id="${g_courseSpecificationData.courseType.a}"]`).checked = true
        document.querySelector(`input[type="radio"][name="I_course_type_b"][id="${g_courseSpecificationData.courseType.b}"]`).checked = true
    }
    document.getElementById('I_course_level').value = g_courseSpecificationData.level
    document.getElementById('I_course_year').value = g_courseSpecificationData.year
    document.getElementById('I_course_general_description').value = g_courseSpecificationData.generalDescription
    //get preRequisits values
    if(g_preRequisits){
        let preCourses = ''
        for(let i = 0; i < g_preRequisits.length; i++){
            preCourses = preCourses + g_preRequisits[i].courseTitle
            + '\t\t' + g_preRequisits[i].courseCode + '\n';
        }
        document.getElementById('I_pre_requirements').value = preCourses
    }
    document.getElementById('I_course_main_objectives').value = g_courseSpecificationData.mainObjectives
    //start of Teaching Mode
    if(g_courseSpecificationData.teachingMode){
        document.getElementById('I_taching_mode_traditional_contact_hours').value = g_courseSpecificationData.teachingMode.traditional
        document.getElementById('I_taching_mode_e_learning_contact_hours').value = g_courseSpecificationData.teachingMode.ELearning
        document.getElementById('I_taching_mode_hybrid_contact_hours').value = g_courseSpecificationData.teachingMode.hybrid
        document.getElementById('I_taching_mode_distance_learning_contact_hours').value = g_courseSpecificationData.teachingMode.distance
    }
    //end of Teaching Mode
    //start of Contact Hours
    if(g_courseSpecificationData.contactHours){
        document.getElementById('I_contact_hours_lectures').value = g_courseSpecificationData.contactHours.lectures
        document.getElementById('I_contact_hours_laboratory').value = g_courseSpecificationData.contactHours.laboratory
        document.getElementById('I_contact_hours_field').value = g_courseSpecificationData.contactHours.field
        document.getElementById('I_contact_hours_tutorial').value = g_courseSpecificationData.contactHours.tutorial
        document.getElementById('I_contact_hours_other').value = g_courseSpecificationData.contactHours.other
    }
    //end of Contact Hours
    //start of CLO
    //end of CLO
    //start of Course Contents => dynamic table
    if(g_courseSpecificationData.courseContent){
        const index = document.createElement('th')
        const h3 = document.createElement('h3')
        for(let i = 0; i < g_courseSpecificationData.courseContent.length; i++){
            const values = [
                g_courseSpecificationData.courseContent[i].topic,
                g_courseSpecificationData.courseContent[i].hours
            ]
            const row = generateRowOfTextareas(values)
            row.insertBefore(index, row.firstChild)
            t_courseContent.insertBefore(row, r_courseContenrButton)
        }
    }
    //end of Course Contents
    //start of Student Assessment Activities => dynamic table
    if(g_courseSpecificationData.assessmentActivities){
        if(g_courseSpecificationData.assessmentActivities[0]){
            const index = document.createElement('th')
            const h3 = document.createElement('h3')
            for(let i = 0; i < g_courseSpecificationData.assessmentActivities.length; i++){
                const value = [
                    g_courseSpecificationData.assessmentActivities[i].activity,
                    g_courseSpecificationData.assessmentActivities[i].timing,
                    g_courseSpecificationData.assessmentActivities[i].percentOfTotalScore
                ]
                const row = generateRowOfTextareas(values)
                row.insertBefore(index, row.firstChild)
                t_assessmentActivities.insertBefore(row, r_assessmentActivitiesButton)
            }
        }
    }
    //end of Student Assessment Activities
    //start of References and Learning Resources => dynamic row (other)
    if(g_courseSpecificationData.references){                                //this will print out all indexes as one value seperated by new line
        document.getElementById('I_students_assessment_activities_essential').value = g_courseSpecificationData.references.essential.join('\n')
        document.getElementById('I_students_assessment_activities_supportive').value = g_courseSpecificationData.references.supportive.join('\n')
        document.getElementById('I_students_assessment_activities_electronic').value = g_courseSpecificationData.references.electronic.join('\n')
        document.getElementById('I_students_assessment_activities_other').value = g_courseSpecificationData.references.other.join('\n')
    }
    //end of References and Learning Resources
    //start of Required Facilities and equipment | array implementation not finished
    if(g_courseSpecificationData.facilitiesResources){
        document.getElementById('I_required_facilities_facilities').value = g_courseSpecificationData.facilitiesResources.facilities.join('\n')
        document.getElementById('I_required_facilities_technology').value = g_courseSpecificationData.facilitiesResources.technology.join('\n')
        document.getElementById('I_required_facilities_Other').value = g_courseSpecificationData.facilitiesResources.other.join('\n')
    }
    //end of Required Facilities and equipment
    //start of Assessment of Course Quality | other array implementation not finished
    if(g_courseSpecificationData.assessmentOfCourseQuality){
        document.getElementById('assessment_quality_teaching_assessor_1').value = g_courseSpecificationData.assessmentOfCourseQuality.teaching.assessor
        document.getElementById('assessment_quality_teaching_method_1').value = g_courseSpecificationData.assessmentOfCourseQuality.teaching.method
        document.getElementById('assessment_quality_assessment_assessor_2').value = g_courseSpecificationData.assessmentOfCourseQuality.studentAssessment.assessor
        document.getElementById('assessment_quality_assessment_method_2').value = g_courseSpecificationData.assessmentOfCourseQuality.studentAssessment.method
        document.getElementById('assessment_quality_resources_assessor_3').value = g_courseSpecificationData.assessmentOfCourseQuality.qualityOfLearning.assessor
        document.getElementById('assessment_quality_resources_method_3').value = g_courseSpecificationData.assessmentOfCourseQuality.qualityOfLearning.method
        document.getElementById('assessment_quality_achieved_assessor').value = g_courseSpecificationData.assessmentOfCourseQuality.extentOfCLO.assessor
        document.getElementById('assessment_quality_achieved_method').value = g_courseSpecificationData.assessmentOfCourseQuality.extentOfCLO.method
        if(g_courseSpecificationData.assessmentOfCourseQuality.other[0].assessor){
            for(let i = 0; g_courseSpecificationData.assessmentOfCourseQuality.other.length; i++){
                const values = [
                    g_courseSpecificationData.assessmentOfCourseQuality.other.assessor,
                    g_courseSpecificationData.assessmentOfCourseQuality.other.method
                ]
                const row = generateRowOfTextareas(values)
                t_assessmentcourseQuality.insertBefore(row, b_assessmentCourseQuality.parentElement.parentElement)
                const spanValue = Number(c_assessmentCourseQuality.getAttribute('rowspan'))
                if(spanValue){
                    c_assessmentCourseQuality.setAttribute('rowspan', spanValue + 1)
                }else{
                    c_assessmentCourseQuality.setAttribute('rowspan', 2)
                }
            }
        }
    }
    //end of Assessment of Course Quality
    //start of specification approval
    document.getElementById('I_approval_council').value = g_courseSpecificationData.specificationApproval.councilCommittee
    document.getElementById('I_approval_refernce').value = g_courseSpecificationData.specificationApproval.referenceNo
    document.getElementById('I_approval_date').value = g_courseSpecificationData.specificationApproval.approvalDate
    //end of specification approval
}
//------------------------------------------------------
//----------------finished pasting data-----------------
//------------------------------------------------------
//--------------starting adding listeners---------------
//------------------------------------------------------
//course content
b_courseContent.addEventListener('click', function(handle){
    //the goal here is to create a row with these elements:
    //[h3 (index), input[type="text"], input[type="text"]]
    const index = document.createElement('th')
    const h3 = document.createElement('h3')
    h3.innerHTML = courseContentCounter++
    index.appendChild(h3)
    const values = ['','']
    const row = generateRowOfTextareas(values)
    row.insertBefore(index, row.firstChild)
    t_courseContent.insertBefore(row, r_courseContenrButton)
})
//assessment activities
b_assessmentActivities.addEventListener('click', function(handle){
    //the goal here is to create a row with these elements:
    //[h3 (index), input[type="text"], input[type="text"], input[type="text"]]
    const index = document.createElement('th')
    const h3 = document.createElement('h3')
    h3.innerHTML = assessmentActivitiesCounter++
    index.appendChild(h3)
    const values = ['','','']
    const row = generateRowOfTextareas(values)
    row.insertBefore(index, row.firstChild)
    t_assessmentActivities.insertBefore(row, r_assessmentActivitiesButton)
})
//assessment of course quality
b_assessmentCourseQuality.addEventListener('click', function(handle){
    //the goal here is to create a row with these element:
    //[input[type="text"], input[type="text"]]
    //also, increase "other" cell column span by 1 every time a new row is added
    const values = ['','']
    const row = generateRowOfTextareas(values)
    t_assessmentcourseQuality.insertBefore(row, b_assessmentCourseQuality.parentElement.parentElement)
    const spanValue = Number(c_assessmentCourseQuality.getAttribute('rowspan'))
    if(spanValue){
        c_assessmentCourseQuality.setAttribute('rowspan', spanValue + 1)
    }else{
        c_assessmentCourseQuality.setAttribute('rowspan', 2)
    }
})
//save course specification action
b_save.addEventListener('click', function(handle){
    //first level data
    let docJson = {
        creditHours: Number(document.getElementById('I_creadit_hours').value),
        generalDescription: document.getElementById('I_course_general_description').value,
        mainObjectives: document.getElementById('I_course_main_objectives').value,
        preRequisits: [],
        courseType: {
            a: document.querySelector(`input[type="radio"][name="I_course_type_a"]:checked`).id,
            b: document.querySelector(`input[type="radio"][name="I_course_type_b"]:checked`).id
        },
        level: document.getElementById('I_course_level').value,
        year: document.getElementById('I_course_year').value,
        version: Number(document.getElementById('I_Version').value),
        lastRevsionDate: document.getElementById('I_Last_Revision_Data').value,
        teachingMode: {
            traditional: document.getElementById('I_taching_mode_traditional_contact_hours').value,
            ELearning: document.getElementById('I_taching_mode_e_learning_contact_hours').value,
            hybrid: document.getElementById('I_taching_mode_hybrid_contact_hours').value,
            distance: document.getElementById('I_taching_mode_distance_learning_contact_hours').value
        },
        contactHours: {
            lectures: Number(document.getElementById('I_contact_hours_lectures').value),
            laboratory: Number(document.getElementById('I_contact_hours_laboratory').value),
            field: Number(document.getElementById('I_contact_hours_field').value),
            tutorial: Number(document.getElementById('I_contact_hours_tutorial').value),
            other: Number(document.getElementById('I_contact_hours_other').value)
        },//requires dynamic (other) row handling
        courseContent: [],//requires dynamic (other) table handling
        assessmentActivities: [],//requires dynamic (other) table handling
        references: {
            essential: [document.getElementById('I_students_assessment_activities_essential').value],
            supportive: [document.getElementById('I_students_assessment_activities_supportive').value],
            electronic: [document.getElementById('I_students_assessment_activities_electronic').value],
            other: [document.getElementById('I_students_assessment_activities_other').value]
        },//most likely the logic in references needs to be reworked
        facilitiesResources: {
            facilities: [document.getElementById('I_required_facilities_facilities').value],
            technology: [document.getElementById('I_required_facilities_technology').value],
            other: [document.getElementById('I_required_facilities_Other').value]
        },
        assessmentOfCourseQuality: {
            teaching: {
                assessor: document.getElementById('assessment_quality_teaching_assessor_1').value,
                method: document.getElementById('assessment_quality_teaching_method_1').value
            },
            studentAssessment: {
                assessor: document.getElementById('assessment_quality_assessment_assessor_2').value,
                method: document.getElementById('assessment_quality_assessment_method_2').value
            },
            qualityOfLearning: {
                assessor: document.getElementById('assessment_quality_resources_assessor_3').value,
                method: document.getElementById('assessment_quality_resources_method_3').value
            },
            extentOfCLO: {
                assessor: document.getElementById('assessment_quality_achieved_assessor').value,
                method: document.getElementById('assessment_quality_achieved_method').value
            },
            other: [{}]
        },//requires dynamic (other) row handling
        specificationApproval: {
            councilCommittee: document.getElementById('I_approval_council').value,
            referenceNo: Number(document.getElementById('I_approval_refernce').value),
            approvalDate: document.getElementById('I_approval_date').value
        },
        CLOs: [],
        program: document.getElementById('I_Program').value
    }
    if(!g_courseSpecificationData.version){
        docJson.version = 1
    }
    updateDocByID(g_courseSpecificationCollRef, g_docID, docJson)
    .then(function(){
        alert("success")
    })
    .catch(function(err){
        alert("something is up.\n" + err)
    })
})