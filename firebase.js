import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAuCf-xbhuWA_YboQZ42kfvjVull2QBNI",
  authDomain: "thamar-elhayat.firebaseapp.com",
  projectId: "thamar-elhayat",
  storageBucket: "thamar-elhayat.firebasestorage.app",
  messagingSenderId: "288468256103",
  appId: "1:288468256103:web:c1c5d1b41f9d1c0f38dbc2",
  measurementId: "G-M9LBNVRY8E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
