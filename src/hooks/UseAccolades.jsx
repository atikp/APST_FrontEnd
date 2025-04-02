// src/hooks/useAccolades.js
import { useUser } from '../context/UserContext';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

// Starting balance
const BASE_BALANCE = 10000;

export default function useAccolades() {
  const { userData, setUserData } = useUser();

  const checkAndAddAccolade = async (accoladeKey, displayName = null) => {
    if (!userData?.uid || !accoladeKey) return;

    const userRef = doc(db, 'users', userData.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userAccolades = userSnap.data()?.FirstTime || [];

    // Already has this accolade
    if (userAccolades.includes(accoladeKey)) return;

    try {
      await updateDoc(userRef, {
        FirstTime: arrayUnion(accoladeKey)
      });

      // Update local state
      setUserData((prev) => ({
        ...prev,
        FirstTime: [...(prev.FirstTime || []), accoladeKey],
      }));

      toast.success(
        `🏆 Accolade Unlocked: ${displayName || accoladeKey.replace(/_/g, ' ')}`
      );
    } catch (error) {
      console.error('Failed to update accolade:', error);
    }
  };

  return { checkAndAddAccolade };
}

export async function checkBalanceMilestones(userData, setUserData) {
  // if (!userData?.uid || !userData?.balance) return;
  // console.log("🏁 Running balance milestone check...");

  if (!userData?.uid || !userData?.balance) {
    console.warn("❌ Missing UID or balance", userData?.uid, userData?.balance);
    return;
  }

  const currentBalance = userData.balance;
  const earned = currentBalance - BASE_BALANCE;
  // console.log("Balance milestone check - earned:", earned);
  const milestones = [
    { threshold: 100, key: "firstHundred", label: "$100" },
    { threshold: 1000, key: "firstThousand", label: "$1,000" },
    { threshold: 5000, key: "firstFiveThousand", label: "$5,000" },
    { threshold: 10000, key: "firstTenThousand", label: "$10,000" },
  ];

  for (const milestone of milestones) {
    if (isNaN(earned)) return;
    if (
      earned >= milestone.threshold &&
      !userData.FirstTime?.includes(milestone.key)
    ) {
      try {
        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          FirstTime: arrayUnion(milestone.key),
        });

        setUserData((prev) => ({
          ...prev,
          FirstTime: [...(prev.FirstTime || []), milestone.key],
        }));

        toast.success(`💸 Achievement Unlocked: Earned ${milestone.label}!`);
      } catch (err) {
        console.error(`Error updating ${milestone.key} accolade:`, err);
      }
    }
  }
}