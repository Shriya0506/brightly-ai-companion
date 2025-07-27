import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLK0a11iSzo0NmD5wS0ihXuWCZe0AoUcQ",
  authDomain: "brightly-789da.firebaseapp.com",
  projectId: "brightly-789da",
  storageBucket: "brightly-789da.appspot.com", 
  messagingSenderId: "677537125673",
  appId: "1:677537125673:web:d7a79befec79ef72e35338"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
