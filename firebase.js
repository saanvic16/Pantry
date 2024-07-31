// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmEYOqWx07x_P2SvJat13XgP_uf4A3sEI",
  authDomain: "pantryapp-2db0a.firebaseapp.com",
  projectId: "pantryapp-2db0a",
  storageBucket: "pantryapp-2db0a.appspot.com",
  messagingSenderId: "488698500380",
  appId: "1:488698500380:web:e88f7ba33fb8c0bba296d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export{app,firestore}