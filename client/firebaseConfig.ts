import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseConfig } from "./config";

const firebaseConfig = getFirebaseConfig();

const app = initializeApp(firebaseConfig);

// For React Native, initializeAuth automatically uses AsyncStorage persistence
const auth = initializeAuth(app);

const db = getFirestore(app);

export { auth, db };
export default app;
