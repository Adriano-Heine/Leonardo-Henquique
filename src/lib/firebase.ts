import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore using the specific database ID provided in the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
