// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { auth,GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6jEvINVsEl88hooQo91Tnapo_XtQAbvw",
  authDomain: "iws-final.firebaseapp.com",
  projectId: "iws-final",
  storageBucket: "iws-final.firebasestorage.app",
  messagingSenderId: "5589187366",
  appId: "1:5589187366:web:bf23f038495ed424b35fe7",
  measurementId: "G-STG45G38B5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };