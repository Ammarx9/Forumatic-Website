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

const s_department = document.getElementById('s_department')

const g_instructorColl = await getCollection(db, 'instructor')
const g_departmentColl = await getCollection(db, 'department')

const q_department = createQuery(g_departmentColl, [])

const snapshot_department = await getDocQuery(q_department)

snapshot_department.forEach((doc) => {
  const data = doc.data()
  const name = data.name

  const option = generateOption(name, doc.id)
  s_department.appendChild(option)
})

const instructorColl = await getCollection(db, 'instructor')

document.getElementById('user_register')
document.querySelector("#user_register").addEventListener("click", async function(handle){
  const user_name = document.getElementById('user_name').value
  const user_emil = document.querySelector("#user_email").value;
  const password = document.querySelector("#user_password").value;

  if(!user_name || !user_emil || !password || s_department.value == 'none'){
    customAlert('Please complete the fields before registration.', 'Incomplete data!')
    await new Promise(r => setTimeout(r, 1200))
    window.location.href = './login.html'
    return
  }

  createUserWithEmailAndPassword(g_auth, user_emil, password)
  .then(async (cred) => {
    const userID = cred.user.uid

    const obj = {
      UID: userID,
      name: user_name,
      department: getDocRefById(g_departmentColl, s_department.value)
    }

    await createDocWithName(db, g_instructorColl, userID, obj)
    setPersistence(g_auth, browserSessionPersistence)
    .then(() => {
    return signInWithEmailAndPassword(g_auth, user_emil, password);
    })
    .catch((error) => {
      console.log(error.code)
      console.log(error.message)
    })

    signInWithEmailAndPassword(g_auth, user_emil, password)
    .then(async cred => {
      customAlert("Welcome aboard!", "Registered")
      //store this in database so we know who this user and give it privilege
      await new Promise(r => setTimeout(r, 1200))
      window.location.href = './savedReports.html'
    })
    .catch(async err => {
      customAlert("You've been successfully registerd, but failed to login in automatically.\nPlease try again by entering your credentials.", "Auto-login failed.")
      await new Promise(r => setTimeout(r, 600))
      window.location.href = './login.html'
    })
  })
})