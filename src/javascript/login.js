import { startFirebaseApp, getFirestoreDB } from "./util/firestoreApp";
import { getCollection } from "./util/collection"
import { createDocWithName, createQuery, getDocQuery, getDocRefById } from "./util/document"
import { customAlert } from "./util/alert"
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, signOut, browserSessionPersistence,
    setPersistence,
    onAuthStateChanged
} from 'firebase/auth'
import { generateOption } from './util/optionGenerator'

const g_app = startFirebaseApp()

const db = await getFirestoreDB();

// same is db from it we can use the auth methods 
const g_auth = getAuth(g_app)

onAuthStateChanged(g_auth, (user) => {
  if(user){
    let login = document.getElementById('N_login')
    login.removeAttribute('href')
    login.innerHTML = "Log out"
    login.addEventListener('click', function(handle){
      g_auth.signOut()
      window.location.href = "./index.html?ste=logout"
    })
  }
})

document.querySelector("#user_login").addEventListener("click", function(){
    let user_emil = document.querySelector("#user_email").value;
    let password = document.querySelector("#user_password").value;

    setPersistence(g_auth, browserSessionPersistence)
    .then(() => {
    return signInWithEmailAndPassword(g_auth, user_emil, password);
    })
    .catch((err) => {
      console.log(err.code)
      console.log(err.message)
      throw new Error()
    })

    // auth merhod for login
    signInWithEmailAndPassword(g_auth, user_emil, password)
    .then(async cred => {
      customAlert("Welcome back!", "Logged in")
      console.log('user logged in:', cred.user)
      //store this in database so we know who this user and give it privilege
      console.log(cred.user.uid)

      await new Promise(r => setTimeout(r, 800))
      window.location.href = './savedReports.html'

    }).catch(async err => {
      customAlert("You've entered incorrect credentials.", "Wrong credentials!")
      await new Promise(r => setTimeout(r, 600))
      window.location.href = './login.html'
    })

})