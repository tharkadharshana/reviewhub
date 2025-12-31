import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDFtRrOXpmmLiI0ZDTOXFI9ZOvLZOZ_dq0",
  authDomain: "calculators-b3a5e.firebaseapp.com",
  projectId: "calculators-b3a5e",
  storageBucket: "calculators-b3a5e.firebasestorage.app",
  messagingSenderId: "37970711186",
  appId: "1:37970711186:web:953c9ce62d9b53fe738c4b",
  measurementId: "G-J2NMNS46HD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Uncomment the line below if testing with local emulators
// import { connectFunctionsEmulator } from "firebase/functions";
// connectFunctionsEmulator(functions, "localhost", 5001);