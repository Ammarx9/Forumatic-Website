import { getDoc, updateDoc } from "firebase/firestore"
export function updatespecificationDoc(db, collectionRef, documentReference, p_docData){
    let docJson = {}

    //example of webpack error when doing nested 'getDoc()' in one place.
    /*getDoc(p_docData.department)
    .then(function(doc){

        getDoc(doc.college)
        .then(function(doc){

            updateDoc(doc.institution, {name: document.getElementById('I_Institution').value})
        })

        

        updateDoc(doc.college, {name: document.getElementById('I_College').value})
    })*/

    //update department, college and institution
    updateDoc(p_docData.institution, {name: document.getElementById('I_Institution').value})

    updateDoc(p_docData.college, {name: document.getElementById('I_College').value})

    updateDoc(p_docData.department, {name: document.getElementById('I_Department').value})

    //update course title and code
    updateDoc(p_docData.course, {
        title: document.getElementById('I_Course_Title').value,
        code: document.getElementById('I_Course_Code').value
    })

    //update program name
    updateDoc(p_docData.program, {
        name: document.getElementById('I_Program').value
    })

    //update version
    docJson['version'] = document.getElementById('I_Version').value

    //update last revision date
    docJson['lastRevisionDate'] = document.getElementById('I_Last_Revision_Data').value

    //update contact hours
    docJson['creditHours'] = document.getElementById('I_creadit_hours').value

    //update course type
    docJson['courseType'] = {
        a: document.querySelector('input[name="I_course_type_a"]:checked').value,
        b: document.querySelector('input[name="I_course_type_b"]:checked').value
    }

    //update course level
    docJson['courseLevel'] = document.getElementById('I_course_level').value

    //update course year
    docJson['courseYear'] = document.getElementById('I_course_year').value

    //update general description
    docJson['generalDescription'] = document.getElementById('I_course_general_description').value

    //update pre-requesites
    docJson['prerequisits'] = document.getElementById('I_pre_requirements').value

    //update main objectives
    docJson['main_objectives'] = document.getElementById('I_course_main_objectives').value

    //update traditional hours
    docJson['traditional'] = document.getElementById('I_taching_mode_traditional_contact_hours').value

    //update e learning hours
    docJson['e_learning'] = document.getElementById('I_taching_mode_e_learning_contact_hours').value

    //update traditional hours
    docJson['hybrid'] = document.getElementById('I_taching_mode_hybrid_contact_hours').value
    
    //update distance hours
    docJson['distance'] = document.getElementById('I_taching_mode_distance_learning_contact_hours').value

    //create contact hours json
    let contactHoursJson = {}

    //save lectures hours
    contactHoursJson['lectures'] = document.getElementById('I_contact_hours_lectures').value

    //save laboratory hours
    contactHoursJson['laboratory'] = document.getElementById('I_contact_hours_laboratory').value

    //save field hours
    contactHoursJson['field'] = document.getElementById('I_contact_hours_field').value

    //save tutorial hours
    contactHoursJson['tutorial'] = document.getElementById('I_contact_hours_tutorial').value

    //insert object
    docJson['contact_hours'] = contactHoursJson

    //create references json object
    let references = {}

    //get and split value for essential references
    references['essential'] = document.getElementById('I_students_assessment_activities_essential').value.split(',')

    //get and split value for supportive references
    references['supportive'] = document.getElementById('I_students_assessment_activities_supportive').value.split(',')

    //get and split value for electronic references
    references['electronic'] = document.getElementById('I_students_assessment_activities_electronic').value.split(',')

    //get and split value for other references
    references['other'] = document.getElementById('I_students_assessment_activities_other').value.split(',')

    //insert object
    docJson['references'] = references

    //create facilities object
    let facilities = {}

    //get and split value for facilities
    facilities['facilities'] = document.getElementById('I_required_facilities_facilities').value.split(',')

    //get and split value for technologies
    facilities['technology'] = document.getElementById('I_required_facilities_technology').value.split(',')

    //get and split value for other
    facilities['other'] = document.getElementById('I_required_facilities_Other').value.split(',')

    //insert object
    docJson['facilities_recourses'] = facilities

    //create quality assessment json object
    let qualityAssessment = {}

    //create json object fror teaching quality

    qualityAssessment['teaching'] = {
        assessor: document.getElementById('assessment_quality_teaching_assessor_1').value,
        method: document.getElementById('assessment_quality_teaching_method_1').value
    }

    qualityAssessment['student_assessment'] = {
        assessor: document.getElementById('assessment_quality_assessment_assessor_2').value,
        method: document.getElementById('assessment_quality_assessment_method_2').value
    }

    qualityAssessment['quality_of_learning'] = {
        assessor: document.getElementById('assessment_quality_resources_assessor_3').value,
        method: document.getElementById('assessment_quality_resources_method_3').value
    }

    qualityAssessment['extent_of_clo'] = {
        assessor: document.getElementById('assessment_quality_achieved_assessor').value,
        method: document.getElementById('assessment_quality_achieved_method').value
    }

    docJson['assessment_of_course_quality'] = qualityAssessment

    docJson['specification_approval'] = {
        council_committee: document.getElementById('I_approval_council').value,
        reference_no: document.getElementById('I_approval_refernce').value,
        approval_date: document.getElementById('I_approval_date').value
    }

    updateDoc(documentReference, docJson)
}