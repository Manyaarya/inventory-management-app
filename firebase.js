// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaoJZirdLpxZog3KUrNhwM7Kd5K94dwUs",
  authDomain: "inventory-management-aa845.firebaseapp.com",
  projectId: "inventory-management-aa845",
  storageBucket: "inventory-management-aa845.appspot.com",
  messagingSenderId: "184851583024",
  appId: "1:184851583024:web:35dd377a0f63252e8c1df5",
  measurementId: "G-ZV84Y21TJY"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}