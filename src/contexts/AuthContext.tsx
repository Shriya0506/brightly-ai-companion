import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  country: string;
  state: string;
  city: string;
  buddyName: string;
  hiddenTabs: string[];
  notificationsEnabled: boolean;
  language: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<UserProfile, 'uid'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("🧠 Firebase Auth user:", user);
      setUser(user);
      if (user) {
  console.log("🧠 Firebase Auth user:", user);

  const userDocRef = doc(db, 'users', user.uid);
  const profileDoc = await getDoc(userDocRef);

  if (profileDoc.exists()) {
    setUserProfile(profileDoc.data() as UserProfile);
    console.log("✅ User profile exists");
  } else {
    console.warn("📄 User profile missing. Creating default profile...");

    const defaultProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || "User",
      age: 0,
      gender: "Other",
      email: user.email || "",
      country: "",
      state: "",
      city: "",
      buddyName: "Brightly",
      hiddenTabs: [],
      notificationsEnabled: true,
      language: "english",
    };

    await setDoc(userDocRef, defaultProfile);
    setUserProfile(defaultProfile);
    console.log("✅ Created default profile");
  }
} else {
  setUserProfile(null);
}
      setLoading(false);
    }); 
    const timeout = setTimeout(() => {
  console.warn("⏰ Firebase is taking too long. Forcing loading to false.");
  setLoading(false);
  }, 8000); // Wait max 8 seconds

  return () => {
  clearTimeout(timeout);  // 🧹 Stop the timeout if Firebase replies on time
  unsubscribe();          // 🔁 This was already there
  };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (userData: Omit<UserProfile, 'uid'> & { password: string }) => {
    const { password, ...profileData } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    
    const profile: UserProfile = {
      ...profileData,
      uid: userCredential.user.uid,
      hiddenTabs: userData.gender !== 'Girl' ? ['blooming-days'] : [],
      notificationsEnabled: true,
      language: userData.language,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), profile);
    setUserProfile(profile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    
    const updatedProfile = { ...userProfile, ...updates };
    await setDoc(doc(db, 'users', user.uid), updatedProfile);
    setUserProfile(updatedProfile);
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};