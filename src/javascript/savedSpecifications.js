import { startFirebaseApp, getFirestoreDB } from "./util/firestoreApp";
import { getCollection } from './util/collection'
import { getDocQuery, getDocByRef, createQuery, getDocRefById, getDocDataByRef } from './util/document'
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
      const a = document.createElement('a')
      a.href = './createDocuments.html'
      a.innerHTML = 'create documents'
      li.appendChild(a)
      login.parentElement.parentElement.appendChild(li)
    }
    setListener()
  }
})
const g_courseSpecificationColl = await getCollection(g_firestoreDB, 'courseSpecification')
async function setListener(){
    b_search.addEventListener("click", getSpecifications)
    b_search.removeAttribute('disabled')
}
async function getSpecifications(){
    b_search.setAttribute('disabled', 'disabled')
    g_reportElement.parentElement.parentElement.appendChild(loaderHTML())
    while(g_reportElement.firstChild){
        g_reportElement.removeChild(g_reportElement.lastChild)
    }
    const specificationQuery = createQuery(g_courseSpecificationColl, [])
    const specificationSnapshot = await getDocQuery(specificationQuery)
    let counter = specificationSnapshot.size
    specificationSnapshot.forEach(async function (doc){
        const docData = doc.data()
        const courseTitle = docData.courseTitle
        const linkElement = document.createElement('a')
        const paragraphElement = document.createElement('p')
        const trElement = document.createElement('tr')
        const tdElement = document.createElement('td')
        const tdElement2 = tdElement.cloneNode()

        paragraphElement.innerHTML = courseTitle
        
        linkElement.innerHTML = 'View'
        linkElement.href = `courseSpecification.html?id=${doc.id}`
        
        tdElement.appendChild(paragraphElement)
        tdElement2.appendChild(linkElement)

        trElement.appendChild(tdElement)
        trElement.appendChild(tdElement2)

        g_reportElement.appendChild(trElement)
        if(!--counter){
            console.log('yes')
        }
    })
    b_search.removeAttribute('disabled')
    const elem = document.getElementById('loader')
    elem.parentElement.removeChild(elem)
}
window.onload = getSpecifications