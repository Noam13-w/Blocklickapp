import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAT9QkoZv2hofTL0W7PAseK6iN5JOW8l-4",
  authDomain: "blocklick-a.firebaseapp.com",
  projectId: "blocklick-a",
  storageBucket: "blocklick-a.firebasestorage.app",
  messagingSenderId: "488846113620",
  appId: "1:488846113620:web:4953b6e278275b3e7fe6c1",
  measurementId: "G-T0322TNM7G"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);