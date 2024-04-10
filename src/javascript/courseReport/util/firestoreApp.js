import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const g_firebaseConfig = {
    apiKey: "AIzaSyDWghDWbfsGy4PpXbHNCmS6srRw8dVEWIA",
    authDomain: "project---auto-ncaaa.firebaseapp.com",
    databaseURL: "https://project---auto-ncaaa-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "project---auto-ncaaa",
    storageBucket: "project---auto-ncaaa.appspot.com",
    messagingSenderId: "646412931799",
    appId: "1:646412931799:web:38705b76096b8fb7731692",
    measurementId: "G-47TNL98QQX"
};

//just to start up Firebase app
export function startFirebaseApp(){
  const app = initializeApp(g_firebaseConfig);

  return app
}

//get firestore DB
export async function getFirestoreDB(){
    const db = getFirestore();

  return db
}