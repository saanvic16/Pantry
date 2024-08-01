// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYQY_spjja8hSysqLB1xsWoaShSRkU0yk",
  authDomain: "pantry-45089.firebaseapp.com",
  projectId: "pantry-45089",
  storageBucket: "pantry-45089.appspot.com",
  messagingSenderId: "635914401783",
  appId: "1:635914401783:web:13037d47c5e81ada9de0f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export{firestore}