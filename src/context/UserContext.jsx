import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);   // ✅ Firebase Auth user
  const [userData, setUserData] = useState(null);         // ✅ Firestore user document
  const [loading, setLoading] =useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user); // user is null if logged out
  
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data(), uid: user.uid }); // ✅ add uid
        } else {
          setUserData(null); // ⚠️ No Firestore data found
        }
      } else {
        setUserData(null); // ✅ User logged out or not found
      }
      setLoading(false)
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, userData, setUserData, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);