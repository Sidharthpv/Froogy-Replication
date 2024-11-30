// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, GoogleAuthProvider , signOut } from "firebase/auth";
import { getFirestore , doc , setDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaGxPDPCx2BB9R8YgS8b6AYfgJoi98PBI",
  authDomain: "froogy-rep.firebaseapp.com",
  projectId: "froogy-rep",
  storageBucket: "froogy-rep.firebasestorage.app",
  messagingSenderId: "1067900457483",
  appId: "1:1067900457483:web:2ab11f2d109627dd73ad0e",
  measurementId: "G-ZKTPPCEGS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db , auth , provider , signOut , doc , setDoc }