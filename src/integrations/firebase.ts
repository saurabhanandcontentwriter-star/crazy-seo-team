import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbGxJMPaOckudX9he6Tj65GHvbM3iNouE",
  authDomain: "anvya-d5142.firebaseapp.com",
  projectId: "anvya-d5142",
  storageBucket: "anvya-d5142.firebasestorage.app",
  messagingSenderId: "688157283807",
  appId: "1:688157283807:web:50e141e2f694f87d4c606a",
  measurementId: "G-N3YRFNKYT6",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
