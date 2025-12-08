// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfjQGjcoA8aGyqLKkjsj7dEl3xImaCEqQ",
  authDomain: "beleza-store.firebaseapp.com",
  projectId: "beleza-store",
  storageBucket: "beleza-store.firebasestorage.app",
  messagingSenderId: "614248620628",
  appId: "1:614248620628:web:9bfb72fb690c02ac21c3c1",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
