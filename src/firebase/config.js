import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: `${process.env.VUE_APP_FIREBASE}`,
  authDomain: "interactive-comments-app.firebaseapp.com",
  projectId: "interactive-comments-app",
  storageBucket: "interactive-comments-app.appspot.com",
  messagingSenderId: "54670069854",
  appId: "1:54670069854:web:2ca9913774b0fd7d8764cf",
};

initializeApp(firebaseConfig);

const db = getFirestore();

export { db };
