import { startFirebaseApp, getFirestoreDB } from "./util/firestoreApp";
import { getCollection } from './util/collection'
import { getDocQuery, getDocByRef, createQuery, getDocRefById, getDocDataByRef } from './util/document'
import { getCurrentYearAndTerm } from './util/calender'
import { filterNonHTMLElements } from './util/filter'
import { customAlert } from './util/alert'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { loaderHTML } from './util/constants'
document.querySelector("#report_srch").setAttribute('disabled', 'disabled')
const g_app = startFirebaseApp()
const g_firestoreDB = await getFirestoreDB();
const g_auth = await getAuth(g_app)
let g_user
const g_reportElement = filterNonHTMLElements(document.getElementById('view_report').childNodes)[1]
const b_search = document.querySelector("#report_srch")
onAuthStateChanged(g_auth, async (user) => {
  if(user){
    g_user = user
    let login = document.getElementById('N_login')
    login.removeAttribute('href')
    login.innerHTML = "Log out"
    login.addEventListener('click', function(handle){
      g_auth.signOut()
      window.location.href = "./index.html?ste=logout"
    })
    const uid = user.uid
    const adminDocRef = await getDocRefById(await getCollection(g_firestoreDB, 'admin'), uid)
    const adminDoc = await getDocDataByRef(adminDocRef)
    if(adminDoc){
      const li = document.createElement('li')
      const li2 = li.cloneNode()
      const a = document.createElement('a')
      const a2 = a.cloneNode()
      a.href = './createDocuments.html'
      a.innerHTML = 'create documents'
      a2.href = './savedSpecifications.html'
      a2.innerHTML = 'saved course specifications'
      li.appendChild(a)
      li2.appendChild(a2)
      login.parentElement.parentElement.appendChild(li)
      login.parentElement.parentElement.appendChild(li2)
    }
    setListener()
  }
})
const g_urlParams = new URLSearchParams(window.location.search);
const ste = g_urlParams.get('ste');
if(ste =="exo"){
  customAlert("The report has been exported and saved successfuly.", "Exported")
}
else if(ste == "sav"){
  customAlert("The report has been saved successfuly.", "Saved")
}
//get course report collection reference
const g_courseReportColl = await getCollection(g_firestoreDB, 'courseReport')
const g_courseSpecificationColl = await getCollection(g_firestoreDB, 'courseSpecification')
//prepare cache object
let g_cache = {
  courseReport: {},
  section: {},
  courseSpecification: {},
  course: {}
}
async function setListener(){
  b_search.addEventListener("click", getReports)
  b_search.removeAttribute('disabled')
}
async function getReports(handle){
  b_search.setAttribute('disabled', 'disabled')
  g_reportElement.parentElement.parentElement.appendChild(loaderHTML())
  while(g_reportElement.firstChild){
    g_reportElement.removeChild(g_reportElement.lastChild)
  }
  //get year and term value for querying
  const user_year = document.querySelector("#year").value
  const user_term = document.querySelector("#term").value
  const currentTime = await getCurrentYearAndTerm(g_firestoreDB)
  let snapshot
  //prepare query
  if(user_year && user_term){//check if year and term has any values
    const query_courseReport = createQuery(g_courseReportColl, [
      'term', '==', Number(user_term),
      'year', '==', Number(user_year),
      'instructor', '==', g_user.uid
    ])
    snapshot = await getDocQuery(query_courseReport)
  }else{//if not, then query everything
    const query_courseReport = createQuery(g_courseReportColl, [
      'term', '==', currentTime.term,
      'year', '==', currentTime.year,
      'instructor', '==', g_user.uid
    ])
    snapshot = await getDocQuery(query_courseReport)
  }
  console.log('query prepared')
  //loop through all retrieved documents
  let counter = snapshot.size
  snapshot.forEach(async (doc) => {
    console.log(doc)
    console.log(doc.id)
    console.log(doc.data())
    //get course report data
    let courseReportData
    //check if course report exists in cache object
    if(g_cache['courseReport'][doc.id]){
      courseReportData = g_cache['courseReport'][doc.id]
    }else{//if course report doesn't exist
      const docID = doc.id
      g_cache['courseReport'] = {[docID]: doc.data()}
      courseReportData = g_cache['courseReport'][docID]
    }
    let sectionDoc = await getDocByRef(courseReportData.section[0])
    let sectionData
    if(g_cache['section'][sectionDoc.id]){//if section exists
      sectionData = g_cache['section'][sectionDoc.id]
    }else{//if section doesn't exist
      const docID = sectionDoc.id
      g_cache['section'] = {[docID]: sectionDoc.data()}
      sectionData = g_cache['section'][docID]
    }
    const query_courseSpecification = createQuery(g_courseSpecificationColl, [
      'courseCode', '==', sectionData.courseCode,
      'version', '==', courseReportData.specificationVersion
    ])
    const courseSpecificationQuery = await getDocQuery(query_courseSpecification)
    let courseSpecificationDoc
    let courseSpecificationData
    courseSpecificationQuery.forEach((doc) => {
      courseSpecificationDoc = doc
    })
    if(g_cache['courseSpecification'][courseSpecificationDoc.id]){//if section exists
      courseSpecificationData = g_cache['courseSpecification'][courseSpecificationDoc.id]
    }else{//if section doesn't exist
      const docID = courseSpecificationDoc.id//get document id
      g_cache['courseSpecification'] = {[docID]: courseSpecificationDoc.data()}//get document data
      courseSpecificationData = g_cache['courseSpecification'][docID]//retrieve document data
    }
    //perpare HTML elements to show retrieved course report documents
    const linkElement = document.createElement('a')
    const paragraphElement = document.createElement('p')
    const trElement = document.createElement('tr')
    const tdElement = document.createElement('td')
    const p_courseTitle = paragraphElement.cloneNode()
    p_courseTitle.innerHTML = courseSpecificationData.courseTitle
    const p_numberOfSections = paragraphElement.cloneNode()
    p_numberOfSections.innerHTML = courseReportData.section.length
    const p_year = paragraphElement.cloneNode()
    p_year.innerHTML = courseReportData.year
    const p_term = paragraphElement.cloneNode()
    p_term.innerHTML = courseReportData.term
    const p_sentStatus = paragraphElement.cloneNode()
    p_sentStatus.innerHTML = String(courseReportData.sentStatus)
    linkElement.href = `courseReport.html?id=${doc.id}`
    linkElement.innerHTML = 'View'
    const td1 = tdElement.cloneNode()
    const td2 = tdElement.cloneNode()
    const td3 = tdElement.cloneNode()
    const td4 = tdElement.cloneNode()
    const td5 = tdElement.cloneNode()
    const td6 = tdElement.cloneNode()
    td1.appendChild(p_courseTitle)
    td2.appendChild(p_numberOfSections)
    td3.appendChild(p_year)
    td4.appendChild(p_term)
    td5.appendChild(p_sentStatus)
    td6.appendChild(linkElement)
    trElement.appendChild(td1)
    trElement.appendChild(td2)
    trElement.appendChild(td3)
    trElement.appendChild(td4)
    trElement.appendChild(td5)
    trElement.appendChild(td6)
    g_reportElement.appendChild(trElement)
    if(!--counter){
      const elem = document.getElementById('loader')
      elem.parentElement.removeChild(elem)
    }
  })
  b_search.removeAttribute('disabled')
}
window.onload = getReports