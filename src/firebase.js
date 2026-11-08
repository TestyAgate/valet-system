import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Replace this object with the exact config Firebase gave you in Step 3
const firebaseConfig = {
  apiKey: "AIzaSyBPR7DRnmDBP0IKcA83xwN2-455XEreSuY",
  authDomain: "valet-system-ef398.firebaseapp.com",
  databaseURL: "https://valet-system-ef398-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "valet-system-ef398",
  storageBucket: "valet-system-ef398.firebasestorage.app",
  messagingSenderId: "396451578572",
  appId: "1:396451578572:web:71209464845cfb585fb869"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);