import { initializeApp } from "firebase/app";
import { getCollection } from "./util/collection.js";
import { getDocDataByRef, getDocRefById } from "./util/document.js";
// to use csv libry with node js
const Papa = require("papaparse");

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

import {
  createTopicNotCoveredRow,
  createCourseImprovmentRow,
} from "./childTemplates";
import { addRows, addRowsAndShiftItems } from "./rowAdder";
import { parseTableToJson } from "./tableParser.js";

let L_topics_not_covered_iterator = 1;

const topicsNotCoveredRowAddButtons = document.querySelector(
  "#B_topics_not_covered_row_adder"
);

const courseImprovmentRowAddButtons = document.querySelector(
  "#B_course_improvment_row_adder"
);

topicsNotCoveredRowAddButtons.addEventListener(
  "click",
  function handleClick(event) {
    addRows(
      topicsNotCoveredRowAddButtons.parentElement.parentElement,
      createTopicNotCoveredRow(L_topics_not_covered_iterator)
    );
    L_topics_not_covered_iterator++;
  }
);

courseImprovmentRowAddButtons.addEventListener(
  "click",
  function handleClick(event) {
    addRows(
      courseImprovmentRowAddButtons.parentElement.parentElement,
      createCourseImprovmentRow(L_topics_not_covered_iterator)
    );
  }
);

const firebaseConfig = {
  apiKey: "AIzaSyDWghDWbfsGy4PpXbHNCmS6srRw8dVEWIA",
  authDomain: "project---auto-ncaaa.firebaseapp.com",
  databaseURL:
    "https://project---auto-ncaaa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project---auto-ncaaa",
  storageBucket: "project---auto-ncaaa.appspot.com",
  messagingSenderId: "646412931799",
  appId: "1:646412931799:web:38705b76096b8fb7731692",
  measurementId: "G-47TNL98QQX",
};

initializeApp(firebaseConfig);

const db = getFirestore();

// get any type of data Reference
function getDataFromReference(reference) {
  return getDoc(reference).then(function (doc) {
    return doc.data();
  });
}

const courseReportColl = collection(db, "course_report");
const instructorColl = collection(db, "instructor");
const coordinatorColl = collection(db, "coordinator");

const documentReference = doc(courseReportColl, "3F5yfK6JmzwCl0laoIr6");

function set_course_values() {
  // get the course report data from firsestore
  getDataFromReference(documentReference).then(async function (
    courseReportData
  ) {
    const sectionData = await getDocDataByRef(courseReportData.section); //get section data
    const courseSpecificationData = await getDocDataByRef(
      sectionData.courseSpecification
    ); //get course specification data
    const courseData = await getDocDataByRef(courseSpecificationData.course); //get course data
    const instructorDocRef = await getDocRefById(
      instructorColl,
      sectionData.instructor
    ); //get instructor document reference
    const coordinatorDocRef = await getDocRefById(
      coordinatorColl,
      sectionData.coordinator
    ); //get coordinator document reference
    const instrcutorData = await getDocDataByRef(instructorDocRef); //get instructor data
    const coordinatorData = await getDocDataByRef(coordinatorDocRef); //get coordinator data

    //paste course data
    document.querySelector("#I_course_title").value = courseData.title;
    document.querySelector("#I_course_code").value = courseData.code;

    //paste section data
    document.querySelector("#I_starting_student").value =
      sectionData.registeredStudents;
    document.querySelector("#I_Completed_student").value =
      courseReportData.completedStudents;
    document.querySelector("#I_academic_year").value = courseReportData.year;
    document.querySelector("#I_semester").value = courseReportData.term;

    //paste instructor data
    document.querySelector("#I_course_instructor").value = instrcutorData.name;

    document.querySelector("#I_grade_a_plus").value =
      courseReportData.grade_distribution.high_a;

    document.querySelector("#I_grade_a").value =
      courseReportData.grade_distribution.a;

    document.querySelector("#I_grade_b_plus").value =
      courseReportData.grade_distribution.high_b;
    document.querySelector("#I_grade_b").value =
      courseReportData.grade_distribution.b;

    document.querySelector("#I_grade_c_plus").value =
      courseReportData.grade_distribution.high_c;
    document.querySelector("#I_grade_c").value =
      courseReportData.grade_distribution.c;

    document.querySelector("#I_grade_d_plus").value =
      courseReportData.grade_distribution.high_d;
    document.querySelector("#I_grade_d").value =
      courseReportData.grade_distribution.d;

    document.querySelector("#I_grade_f").value =
      courseReportData.grade_distribution.f;

    document.querySelector("#I_grade_denied_entry").value =
      courseReportData.grade_distribution.denied;
    document.querySelector("#I_grade_in_progress").value =
      courseReportData.grade_distribution.in_progress;
    document.querySelector("#I_grade_incomplete").value =
      courseReportData.grade_distribution.incomplete;
    document.querySelector("#I_grade_pass").value =
      courseReportData.grade_distribution.pass;
    document.querySelector("#I_grade_fail").value =
      courseReportData.grade_distribution.fail;
    document.querySelector("#I_grade_withdrawn").value =
      courseReportData.grade_distribution.withdrawn;

    let grades = {
      high_a: courseReportData.grade_distribution.high_a,
      a: courseReportData.grade_distribution.a,
      high_b: courseReportData.grade_distribution.high_b,
      b: courseReportData.grade_distribution.b,
      high_c: courseReportData.grade_distribution.high_c,
      c: courseReportData.grade_distribution.c,
      high_d: courseReportData.grade_distribution.high_d,
      d: courseReportData.grade_distribution.d,
      f: courseReportData.grade_distribution.f,
      denied: courseReportData.grade_distribution.denied,
      in_progress: courseReportData.grade_distribution.in_progress,
      incomplete: courseReportData.grade_distribution.incomplete,
      pass: courseReportData.grade_distribution.pass,
      fail: courseReportData.grade_distribution.fail,
      withdrawn: courseReportData.grade_distribution.withdrawn,
    };

    grade_percent(grades);

    // topic not coverd data

    const topic_not_coverd = courseReportData.topics_not_covered;

    console.log(topic_not_coverd[0].topic);
    console.log(topic_not_coverd[0].reason);
    console.log(topic_not_coverd[0].impact);
    console.log(topic_not_coverd[0].compensation);

    // course improvents
    const course_improvement = courseReportData.course_improvement;

    console.log("rec", course_improvement[0].recommendation);
    console.log("ac", course_improvement[0].action);
    console.log("nedsup", course_improvement[0].needed_support);

    // CLO

    const clo_data = courseReportData.clo;

    // for knowledge
    getDataFromReference(clo_data.knowledge).then(function (knowledge_data) {
      // console.log("this how to get len ::",knowledge_data.Learning_outcomes.length)

      document.querySelector("#Course_Learning_1_1").value =
        knowledge_data.Learning_outcomes[0];
      document.querySelector("#Assessment_Methods_1_1").value =
        knowledge_data.assessment_methods[0];
      document.querySelector("#Targeted_Level_1_1").value =
        knowledge_data.target_level[0];
      document.querySelector("#Actual_Leve_1_1").value =
        courseReportData.actual_level.knowledge[0];
      document.querySelector("#Comment_on_Results_1_1").value =
        courseReportData.assessment_comment.knowledge[0];

      document.querySelector("#Course_Learning_1_2").value =
        knowledge_data.Learning_outcomes[1];
      document.querySelector("#Assessment_Methods_1_2").value =
        knowledge_data.assessment_methods[1];
      document.querySelector("#Targeted_Level_1_2").value =
        knowledge_data.target_level[1];
      document.querySelector("#Actual_Leve_1_2").value =
        courseReportData.actual_level.knowledge[1];
      document.querySelector("#Comment_on_Results_1_2").value =
        courseReportData.assessment_comment.knowledge[1];
    });

    //   skill
    getDataFromReference(clo_data.skill).then(function (skill_data) {
      document.querySelector("#Course_Learning_2_1").value =
        skill_data.Learning_outcomes[0];
      document.querySelector("#Assessment_Methods_2_1").value =
        skill_data.assessment_methods[0];
      document.querySelector("#Targeted_Level_2_1").value =
        skill_data.target_level[0];
      document.querySelector("#Actual_Leve_2_1").value =
        courseReportData.actual_level.skill[0];
      document.querySelector("#Comment_on_Results_2_1").value =
        courseReportData.assessment_comment.skill[0];

      document.querySelector("#Course_Learning_2_2").value =
        skill_data.Learning_outcomes[1];
      document.querySelector("#Assessment_Methods_2_2").value =
        skill_data.assessment_methods[1];
      document.querySelector("#Targeted_Level_2_2").value =
        skill_data.target_level[1];
      document.querySelector("#Actual_Leve_2_2").value =
        courseReportData.actual_level.skill[1];
      document.querySelector("#Comment_on_Results_2_2").value =
        courseReportData.assessment_comment.skill[1];
    });

    // value

    getDataFromReference(clo_data.value).then(function (value_data) {
      document.querySelector("#Course_Learning_3_1").value =
        value_data.Learning_outcomes[0];
      document.querySelector("#Assessment_Methods_3_1").value =
        value_data.assessment_methods[0];
      document.querySelector("#Targeted_Level_3_1").value =
        value_data.target_level[0];
      document.querySelector("#Actual_Leve_3_1").value =
        courseReportData.actual_level.value[0];
      document.querySelector("#Comment_on_Results_3_1").value =
        courseReportData.assessment_comment.value[0];

      document.querySelector("#Course_Learning_3_2").value =
        value_data.Learning_outcomes[1];
      document.querySelector("#Assessment_Methods_3_2").value =
        value_data.assessment_methods[1];
      document.querySelector("#Targeted_Level_3_2").value =
        value_data.target_level[1];
      document.querySelector("#Actual_Leve_3_2").value =
        courseReportData.actual_level.value[1];
      document.querySelector("#Comment_on_Results_3_2").value =
        courseReportData.assessment_comment.value[1];
    });
  });
}

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

 

  document.querySelector("#I_grade_a_plus_Percentage").value = high_a;

  document.querySelector("#I_grade_a_Percentage").value = a;
  document.querySelector("#I_grade_b_plus_Percentage").value = high_b;
  document.querySelector("#I_grade_b_Percentage").value = b;

  document.querySelector("#I_grade_c_plus_Percentage").value = high_c;
  document.querySelector("#I_grade_c_Percentage").value = c;

  document.querySelector("#I_grade_d_plus_Percentage").value = high_d;
  document.querySelector("#I_grade_d_Percentage").value = d;

  document.querySelector("#I_grade_f_Percentage").value = f;
}
let csv = document.querySelector("#grade_csv");
csv.addEventListener("change", grade_csv_set);

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

document.querySelector("#export_rep").addEventListener("click",export_report_api())




async function  export_report_api (){
    // this code will make obj that take all report data
    let json_data = json_api
    try {
        const response = await fetch(url, {
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
        console.log(jsonResponse);
      } catch (error) {
        console.error('Error:', error);
      }

}
function json_api(){

    // Check if the "I_location_campus" radio is checked retun true or false
  const campusRadioChecked = document.getElementById('I_location_campus').checked;

  
  const branchRadioChecked = document.getElementById('I_location_branch').checked;
  let loc = ""

  
  if (campusRadioChecked) {
    loc = "main"
    
  } else if (branchRadioChecked) {
    loc = "br"
    
  }
  
   
    let j_obj ={
        course_title : document.querySelector("#I_course_title").value ,
        course_code : document.querySelector("#I_course_code").value ,
        department :document.querySelector("#I_department").value ,
        program :document.querySelector("#I_program").value ,
        college :document.querySelector("#I_college").value ,
        institution :document.querySelector("#I_institution").value ,
        academic_year :document.querySelector("#I_academic_year").value ,
        semester :document.querySelector("#I_semester").value ,
        course_Instructor :document.querySelector("#I_course_instructor").value ,
        course_coordinator :document.querySelector("#I_course_coordinator").value ,
        loc :loc ,
        section_num :document.querySelector("#I_number_of_section").value ,
        students_str :document.querySelector("#I_starting_student").value ,
        students_coml:document.querySelector("#I_Completed_student").value ,
        report_date :document.querySelector("#I_report_date").value ,

        ap:document.querySelector("#I_grade_a_plus").value ,
        a:document.querySelector("#I_grade_a").value ,
        bp:document.querySelector("#I_grade_b_plus").value ,
        b:document.querySelector("#I_grade_b").value ,
        cp:document.querySelector("#I_grade_c_plus").value ,
        c:document.querySelector("#I_grade_c").value ,
        dp:document.querySelector("#I_grade_d_plus").value ,
        d:document.querySelector("#I_grade_d").value ,
        f:document.querySelector("#I_grade_f").value ,
        dn:document.querySelector("#I_grade_denied_entry").value ,
        ip:document.querySelector("#I_grade_in_progress").value ,
        ic:document.querySelector("#I_grade_incomplete").value ,
        pass:document.querySelector("#I_grade_pass").value ,
        fail:document.querySelector("#I_grade_fail").value ,
        w:document.querySelector("#I_grade_withdrawn").value ,

        ap_pre:document.querySelector("#I_grade_a_plus_Percentage").value ,
        a_pre:document.querySelector("#I_grade_a_Percentage").value ,
        bp_pre:document.querySelector("#I_grade_b_plus_Percentage").value ,
        b_pre:document.querySelector("#I_grade_b_Percentage").value ,
        cp_pre:document.querySelector("#I_grade_c_plus_Percentage").value ,
        c_pre:document.querySelector("#I_grade_c_Percentage").value ,
        dp_pre:document.querySelector("#I_grade_d_plus_Percentage").value ,
        d_pre:document.querySelector("#I_grade_d_Percentage").value ,
        dn_pre:document.querySelector("#").value ,
        ip_pre:document.querySelector("#").value ,
        ic_pre:document.querySelector("#").value ,
        pass_pre:document.querySelector("#").value ,
        fail_pre:document.querySelector("#").value ,
        w_pre:document.querySelector("#").value ,

        // Grades_comm:

        // Recommendations:

         
            

        




    }

    return j_obj

}



  
set_course_values();
