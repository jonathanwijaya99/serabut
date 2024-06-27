import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEZuDb8D_kD3R_BTgK_eftqNVwZt6uKMA",
  authDomain: "serabut-bff51.firebaseapp.com",
  projectId: "serabut-bff51",
  storageBucket: "serabut-bff51.appspot.com",
  messagingSenderId: "424674733238",
  appId: "1:424674733238:web:69a92fe63b9ca08d8cca17",
  measurementId: "G-QDJP53718Q"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const auth = firebase.auth();
export const firestore = firebase.firestore();