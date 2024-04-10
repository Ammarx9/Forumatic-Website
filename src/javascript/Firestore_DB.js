// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// تستدعي الميثود الي نحتاجها
// (initializeApp) method will connect you to your firebase project
import { initializeApp } from "firebase/app";
import { createCourseContentRow, createStudentAssessmentActivityContentRow, createAssessmentOfQualityRow} from "./childTemplates";
import { addRows, addRowsAndShiftItems } from "./rowAdder";
import { parseTableToJson } from "./tableParser.js";
import { updatespecificationDoc } from "./specification page/update_data.js";

var L_course_content_iterator = 1;
var L_student_assessment_activities = 1;

const courseContentRowAddButtons = document.querySelector("#B_course_content_row_adder");
const studentAssessmentActivityRowAddButtons = document.querySelector("#B_student_assessment_activity_row_adder");
const assessmentOfQualityRowAddButtons = document.querySelector("#B_assessment_of_quality_row_adder");
const T_course_content = document.querySelector("#T_course_content");
const B_send = document.querySelector("#B_send");

courseContentRowAddButtons.addEventListener('click', function handleClick(event){
  addRows(courseContentRowAddButtons.parentElement.parentElement, createCourseContentRow(L_course_content_iterator));
  L_course_content_iterator++;
});

studentAssessmentActivityRowAddButtons.addEventListener('click', function handleClick(event){
  addRows(studentAssessmentActivityRowAddButtons.parentElement.parentElement, createStudentAssessmentActivityContentRow(L_student_assessment_activities));
  L_student_assessment_activities++;
});

var buttonParentNode = assessmentOfQualityRowAddButtons.parentElement

assessmentOfQualityRowAddButtons.addEventListener('click', function handleClick(event){
  addRowsAndShiftItems(assessmentOfQualityRowAddButtons.parentElement.parentElement, createAssessmentOfQualityRow(), [buttonParentNode], document.querySelector('#C_assessment_of_quality_cell'));
});

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWghDWbfsGy4PpXbHNCmS6srRw8dVEWIA",
  authDomain: "project---auto-ncaaa.firebaseapp.com",
  databaseURL: "https://project---auto-ncaaa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project---auto-ncaaa",
  storageBucket: "project---auto-ncaaa.appspot.com",
  messagingSenderId: "646412931799",
  appId: "1:646412931799:web:38705b76096b8fb7731692",
  measurementId: "G-47TNL98QQX"
};

initializeApp(firebaseConfig);

const db = getFirestore();

// collection ref
// here we give what database are used and what collection we want 
const specification_coll = collection(db, "specification_reports");

//  will get id value from saved report by using url
const urlParams = new URLSearchParams(window.location.search);
const reportId = urlParams.get('id');

//   this line will get docment based on it is reference 
const documentReference = doc(specification_coll, reportId);

let specification_obj;
getDoc(documentReference)//first action
.then(function(doc)  {
// now we have all docment data field
const report_data = doc.data()

//register click listener with retrieved data
B_send.addEventListener('click', function handleClick(event){
  updatespecificationDoc(db, specification_coll, documentReference, report_data)
});

// now we make obj to store this data
specification_obj = {
  course :  report_data.course  ,
  program : report_data.program   ,
  institution : report_data.institution,
  college : report_data.college,
  department : report_data.department ,
  clo : report_data.CLO ,

  prerequisite :  report_data.prerequisite ,
  specification_version : report_data.specification_version ,

  last_revision_date : report_data.last_revision_date ,
  teaching_mode : report_data.teaching_mode ,

  course_contents : report_data.course_contents,

  assessment_activities : report_data.assessment_activities,
  
  essential : report_data.essential ,
  supportive : report_data.supportive , 

  electronic : report_data.electronic,
  
  other : report_data.other ,

  equipment : report_data.equipment,
  recources : report_data.resources,

  assessment_of_course_quality :  report_data.assessment_of_course_quality ,

  specification_approval : report_data.specification_approval,



}

//-----------------------------------
//start of course identification area
//-----------------------------------

const course_identification_json = {
  credit_hours: report_data.course_identification.credit_hours,
  course_type_a: report_data.course_identification.course_type.type_a,
  course_type_b: report_data.course_identification.course_type.type_b,
  level: report_data.course_identification.level,
  year: report_data.course_identification.year,
  general_description: report_data.course_identification.course_general_description,
  prerequisits: "",
  main_objectives: ""
}

let arr1 = []

for(let i = 0; i < report_data.prerequisits.length; i++){
  getDataFromReference(report_data.prerequisits[i]).then(function (course){
    let temp = (' ' + course.name).slice(1)
    arr1.push(temp)
  })
}

course_identification_json.prerequisits = arr1

let arr = []

for(let i = 0; i < report_data.course_main_objectives.length; i++){
  arr.push(report_data.course_main_objectives[i])
}

course_identification_json.main_objectives = arr

//console.log(course_identification_json)

//-----------------------------------
//-end of course identification area-
//-----------------------------------



specification_report_set_values(specification_obj, course_identification_json)
});
// get any type of data Reference
function getDataFromReference(reference) {
return getDoc(reference)
    .then(function(doc) {
        return doc.data();
    });
}

function specification_report_set_values (specification_obj, course_identification_json){//second action
// course
const course_reference = specification_obj.course;
getDataFromReference(course_reference)
.then(function(courseData){
  document.querySelector("#I_Course_Title").value = courseData.name
  document.querySelector("#I_Course_Code").value = courseData.Course_Code
})

// program
const Program_reference = specification_obj.program
getDataFromReference(Program_reference)
.then(function(programData){
  document.querySelector("#I_Program").value = programData.name
  
})


// Department and college and institution
const Department_reference = specification_obj.department
getDataFromReference(Department_reference)
.then(function(Department_data){
  document.querySelector("#I_Department").value = Department_data.name
  
  const College_reference = Department_data.college
  getDataFromReference(College_reference)
.then(function(CollegeData){
  document.querySelector("#I_College").value = CollegeData.name

  const  institution_reference = CollegeData.institution;
  console.log(CollegeData.institution)
  // erorr here undefined for some reson
getDataFromReference(institution_reference)
.then(function(institutionData){
  console.log(institutionData)
  document.querySelector("#I_Institution").value = institutionData.name
  
})
  
})
})

document.querySelector("#I_Version").value = specification_obj.specification_version
document.querySelector("#I_Last_Revision_Data").value = specification_obj.last_revision_date

//start of inserting course identification information

let name_a = '#' + course_identification_json.course_type_a
let name_b = '#' + course_identification_json.course_type_b

document.querySelector("#I_creadit_hours").value = course_identification_json.credit_hours
document.querySelector(name_a).checked = true
document.querySelector(name_b).checked = true
document.querySelector("#I_course_level").value = course_identification_json.level
document.querySelector("#I_course_year").value = course_identification_json.year
document.querySelector("#I_course_general_description").value = course_identification_json.general_description
document.querySelector("#I_pre_requirements").value = course_identification_json.prerequisits
document.querySelector("#I_course_main_objectives").value = course_identification_json.main_objectives

  // clo
  let clo_array = specification_obj.clo
  const clo_reference = clo_array[0];
  getDataFromReference(clo_reference)
  .then(clo_set)//jump third action

//Teaching_Mode 
const Teaching_Mode = specification_obj.teaching_mode
document.querySelector("#I_taching_mode_traditional_contact_hours").value = Teaching_Mode.traditional
document.querySelector("#I_taching_mode_e_learning_contact_hours").value = Teaching_Mode.e_learning

  document.querySelector("#I_taching_mode_hybrid_contact_hours").value = Teaching_Mode.hybrid
  document.querySelector("#I_taching_mode_distance_learning_contact_hours").value = Teaching_Mode.distance

  //references
  document.querySelector("#I_students_assessment_activities_essential").value = specification_obj.essential
  document.querySelector("#I_students_assessment_activities_supportive").value = specification_obj.supportive
  document.querySelector("#I_students_assessment_activities_electronic").value = specification_obj.electronic
  document.querySelector("#I_students_assessment_activities_other").value = specification_obj.other
  
const specification_approval  = specification_obj.specification_approval;
document.querySelector("#I_approval_council").value = specification_approval.council_committee;
document.querySelector("#I_approval_refernce").value = specification_approval.reference_no;
document.querySelector("#I_approval_date").value = specification_approval.approval_date;

const equipment = specification_obj.equipment;


document.querySelector("#I_required_facilities_facilities").value = equipment[0];
document.querySelector("#I_required_facilities_technology").value = equipment[1];
document.querySelector("#I_required_facilities_Other").value = equipment[2];

// Assessment
const Assessment = specification_obj.assessment_of_course_quality;
console.log("the anset as :",Assessment.quality_of_learning.assessor)
document.querySelector("#assessment_quality_teaching_assessor_1").value = Assessment.teaching.assessor;
document.querySelector("#assessment_quality_teaching_method_1").value = Assessment.teaching.method;

document.querySelector("#assessment_quality_assessment_assessor_2").value = Assessment.student_assessment.assessor;
document.querySelector("#assessment_quality_assessment_method_2").value = Assessment.student_assessment.method;

document.querySelector("#assessment_quality_resources_assessor_3").value = Assessment.quality_of_learning.assessor;
document.querySelector("#assessment_quality_resources_method_3").value = Assessment.quality_of_learning.method;

document.querySelector("#assessment_quality_achieved_assessor").value = Assessment.extent_of_clo.assessor;
document.querySelector("#assessment_quality_achieved_method").value = Assessment.extent_of_clo.method;







}


function clo_set(clo_data){//third action
 
  
  document.querySelector("#Course_Learning_1_1").value = clo_data.learning_outcome[0]
  document.querySelector("#Course_Learning_1_2").value = clo_data.learning_outcome[1]
  document.querySelector("#Course_Learning_1_3").value = clo_data.learning_outcome[2]

document.querySelector("#Course_Learning_2_1").value = clo_data.learning_outcome[3]
document.querySelector("#Course_Learning_2_2").value = clo_data.learning_outcome[4]
document.querySelector("#Course_Learning_2_3").value = clo_data.learning_outcome[5]

document.querySelector("#Course_Learning_3_1").value = clo_data.learning_outcome[6]
document.querySelector("#Course_Learning_3_2").value = clo_data.learning_outcome[7]
document.querySelector("#Course_Learning_3_3").value = clo_data.learning_outcome[8]


let plo = clo_data.plo[0]
getDataFromReference(plo)
.then(function(plo_data){
  document.querySelector("#Code_clo_1_1").value = plo_data.type
  document.querySelector("#Code_clo_1_2").value = plo_data.type
  document.querySelector("#Code_clo_1_3").value = plo_data.type
  document.querySelector("#Code_clo_2_1").value = plo_data.type
  document.querySelector("#Code_clo_2_2").value = plo_data.type
  document.querySelector("#Code_clo_2_3").value = plo_data.type
  document.querySelector("#Code_clo_3_1").value = plo_data.type
  document.querySelector("#Code_clo_3_2").value = plo_data.type
  document.querySelector("#Code_clo_3_3").value = plo_data.type

})

document.querySelector("#Teaching_Strategies_1_1").value = clo_data.teaching_strategy[0]
document.querySelector("#Teaching_Strategies_1_2").value = clo_data.teaching_strategy[1]
document.querySelector("#Teaching_Strategies_1_3").value = clo_data.teaching_strategy[2]

document.querySelector("#Teaching_Strategies_2_1").value = clo_data.teaching_strategy[3]
document.querySelector("#Teaching_Strategies_2_2").value = clo_data.teaching_strategy[4]
document.querySelector("#Teaching_Strategies_2_3").value = clo_data.teaching_strategy[5]

document.querySelector("#Teaching_Strategies_3_1").value = clo_data.teaching_strategy[6]
document.querySelector("#Teaching_Strategies_3_2").value = clo_data.teaching_strategy[7]
document.querySelector("#Teaching_Strategies_3_3").value = clo_data.teaching_strategy[8]






document.querySelector("#Comment_Assessment_1_1").value = clo_data.comment[0]
document.querySelector("#Comment_Assessment_1_2").value = clo_data.comment[1]
document.querySelector("#Comment_Assessment_1_3").value = clo_data.comment[2]

document.querySelector("#Comment_Assessment_2_1").value = clo_data.comment[3]
document.querySelector("#Comment_Assessment_2_2").value = clo_data.comment[4]
document.querySelector("#Comment_Assessment_2_3").value = clo_data.comment[5]

document.querySelector("#Comment_Assessment_3_1").value = clo_data.comment[6]
document.querySelector("#Comment_Assessment_3_2").value = clo_data.comment[7]
document.querySelector("#Comment_Assessment_3_3").value = clo_data.comment[8]


}


let send_butt = document.querySelector("#B_save");
send_butt.addEventListener("submit", function(e)  {
let I_creadit_hours = document.querySelector("#I_creadit_hours").value


})











// getDoc(doc_ref_getdoc)
// .then((snapshot)=> {
//     console.log(snapshot.data() ,snapshot.id)
// })
// console.log("he get it");
// getDoc(doc_ref_getdoc).then((doc) => {
//   let name = doc.data()
//   console.log(name.name);
// });






