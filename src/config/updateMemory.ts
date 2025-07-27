import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const updateMemory = async (uid: string, tab: string, memory: string) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const prev = docSnap.data().tabMemories || {};
    await updateDoc(userRef, {
      tabMemories: {
        ...prev,
        [tab]: memory
      }
    });
  } else {
    await setDoc(userRef, {
      tabMemories: {
        [tab]: memory
      }
    }, { merge: true });
  }
};
