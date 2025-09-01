import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseConfig } from "./config";

const firebaseConfig = getFirebaseConfig();

const app = initializeApp(firebaseConfig);

// React Native Firebase automatically uses AsyncStorage for persistence
const auth = initializeAuth(app);

const db = getFirestore(app);

export { auth, db };
export default app;
