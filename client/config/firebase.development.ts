export const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyDHpzlBUPgno_MsW9RCZzyswmt7eNPOUkA",
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN || "dormduty-fe29c.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "dormduty-4c06a",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "dormduty-4c06a.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "20525782402",
  appId:
    process.env.FIREBASE_APP_ID || "1:20525782402:web:26df1a3eae7a6b5c8ceb9b",
};
