// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {initializeAuth, getReactNativePersistence} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXTSG_qwpv1b-fdRR0Os9O74IK99iLcKw",
  authDomain: "dormduty-2f9c0.firebaseapp.com",
  projectId: "dormduty-2f9c0",
  storageBucket: "dormduty-2f9c0.firebasestorage.app",
  messagingSenderId: "874859218105",
  appId: "1:874859218105:web:0b83d7645ef8095e9f4768",
  measurementId: "G-CXQXWJWCTP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// db
export const firestore = getFirestore(app);