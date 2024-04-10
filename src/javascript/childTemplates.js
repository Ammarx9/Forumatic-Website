export function createCourseContentRow(iterator){
    const childCourseContentRow = document.createElement("tr");

    const childCourseContentData = document.createElement("td");

    const childCourseContentInput = document.createElement("input");

    childCourseContentInput.type = "text";

    const childCourseContentH3 = document.createElement("h3");

    childCourseContentH3.innerHTML = iterator;

    const childCourseContentDataWtihH3 = childCourseContentData.cloneNode(true);

    childCourseContentDataWtihH3.appendChild(childCourseContentH3);

    childCourseContentData.appendChild(childCourseContentInput);

    const secondChildCourseContentData = childCourseContentData.cloneNode(true);

    childCourseContentRow.appendChild(childCourseContentDataWtihH3);
    childCourseContentRow.appendChild(childCourseContentData);
    childCourseContentRow.appendChild(secondChildCourseContentData);

    return childCourseContentRow;
}

export function createStudentAssessmentActivityContentRow(iterator){
    const childCourseContentRow = document.createElement("tr");

    const childCourseContentData = document.createElement("td");

    const childCourseContentInput = document.createElement("input");

    childCourseContentInput.type = "text";

    const childCourseContentH3 = document.createElement("h3");

    childCourseContentH3.innerHTML = iterator;

    const childCourseContentDataWtihH3 = childCourseContentData.cloneNode(true);

    childCourseContentDataWtihH3.appendChild(childCourseContentH3);

    childCourseContentData.appendChild(childCourseContentInput);

    const secondChildCourseContentData = childCourseContentData.cloneNode(true);

    const thirdChildCourseContentData = childCourseContentData.cloneNode(true);

    childCourseContentRow.appendChild(childCourseContentDataWtihH3);
    childCourseContentRow.appendChild(childCourseContentData);
    childCourseContentRow.appendChild(secondChildCourseContentData);
    childCourseContentRow.appendChild(thirdChildCourseContentData);

    return childCourseContentRow;
}

export function createAssessmentOfQualityRow(){
    const childAssessmentOfQualityData = document.createElement("td");

    const childAssessmentOfQualityInput = document.createElement("input");

    childAssessmentOfQualityData.appendChild(childAssessmentOfQualityInput);

    const secondChildAssessmentOfQualityData = childAssessmentOfQualityData.cloneNode(true);

    const result = [childAssessmentOfQualityData, secondChildAssessmentOfQualityData]

    return result;
}

export function createTopicNotCoveredRow(iterator){
    const childCourseContentRow = document.createElement("tr");

    const childCourseContentData = document.createElement("td");

    const childCourseContentInput = document.createElement("input");

    childCourseContentInput.type = "text";

    const childCourseContentH3 = document.createElement("h3");

    childCourseContentH3.innerHTML = iterator;

    const childCourseContentDataWtihH3 = childCourseContentData.cloneNode(true);

    childCourseContentDataWtihH3.appendChild(childCourseContentH3);

    childCourseContentData.appendChild(childCourseContentInput);

    const secondChildCourseContentData = childCourseContentData.cloneNode(true);

    const thirdChildCourseContentData = childCourseContentData.cloneNode(true);

    childCourseContentRow.appendChild(childCourseContentDataWtihH3);
    childCourseContentRow.appendChild(childCourseContentData);
    childCourseContentRow.appendChild(secondChildCourseContentData);
    childCourseContentRow.appendChild(thirdChildCourseContentData);

    return childCourseContentRow;
}

export function createCourseImprovmentRow(){
    const childCourseContentRow = document.createElement("tr");

    const childAssessmentOfQualityData = document.createElement("td");

    const childAssessmentOfQualityInput = document.createElement("input");

    childAssessmentOfQualityInput.type = "text";

    childAssessmentOfQualityData.appendChild(childAssessmentOfQualityInput);

    const secondChildAssessmentOfQualityData = childAssessmentOfQualityData.cloneNode(true);

    const thirdChildAssessmentOfQualityData = childAssessmentOfQualityData.cloneNode(true);

    childCourseContentRow.appendChild(childAssessmentOfQualityData)
    childCourseContentRow.appendChild(secondChildAssessmentOfQualityData)
    childCourseContentRow.appendChild(thirdChildAssessmentOfQualityData)

    return childCourseContentRow;
}
