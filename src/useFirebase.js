import { useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Firebase SDK configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBevweMy2v48Meun9s80B6GTLjom8Ao-J4",
  authDomain: "iu-quizapp.firebaseapp.com",
  databaseURL:
    "https://iu-quizapp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iu-quizapp",
  storageBucket: "iu-quizapp.appspot.com",
  messagingSenderId: "1086779168474",
  appId: "1:1086779168474:web:ede6332a4022776237f7e3",
};

export function useFirebase() {
  const app = useMemo(() => initializeApp(firebaseConfig), []);
  const firestore = useMemo(() => getFirestore(app), [app]);
  const database = useMemo(() => getDatabase(app), [app]);
  const storage = useMemo(() => getStorage(app), [app]);
  const auth = useMemo(() => getAuth(app), [app]);

  return { app, firestore, database, storage, auth };
}
