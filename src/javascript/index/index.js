import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { customAlert } from './util/alert'
import { startFirebaseApp, getFirestoreDB } from './util/firestoreApp'
import { filterNonHTMLElements } from '../courseReport/util/filter';
const g_urlParams = new URLSearchParams(window.location.search);
const ste = g_urlParams.get('ste');
const g_app = startFirebaseApp()
const g_db = getFirestoreDB()
const g_auth = await getAuth(g_app)
if(ste == 'logout'){
    customAlert('You have logged out successfully.', "Logout")
}else if(ste == 'not'){
    customAlert("Please login before using our services.", "Login first!")
}
onAuthStateChanged(g_auth, (user) => {
    if(user){
        const login = document.getElementById('N_login')
        login.removeAttribute('href')
        login.innerHTML = "logout"
        login.addEventListener('click', function(handle){
            g_auth.signOut()
            window.location.href = "./index.html"
        })
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.setAttribute('href', './savedReports.html')
        a.innerHTML = 'Saved Reports'
        li.appendChild(a)
        const menu = document.getElementById('N_menu')
        const children = filterNonHTMLElements(menu.childNodes)
        menu.appendChild(li)
        menu.appendChild(login.parentElement)
    }
})