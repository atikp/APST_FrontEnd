// src/hooks/useLoginStreak.js
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../firebase';

export async function handleLoginStreak(userData, setUserData) {
  if (!userData?.uid) return;

  const userRef = doc(db, 'users', userData.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const user = userSnap.data();
  const now = new Date();
  const today = now.toDateString();
  const lastLogin = user.lastLoginDate || null;
  const streak = user.loginStreak || 0;
  const balance = user.balance || 0;
  let newStreak = streak;
  let reward = 0;

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // If first login or not yesterday, reset streak
  if (!lastLogin || (lastLogin !== today && lastLogin !== yesterdayStr)) {
    newStreak = 1;
    reward = 10;
  } else if (lastLogin === yesterdayStr) {
    newStreak += 1;
    reward = 10;

    if (newStreak === 7) {
      reward = 100;
    } else if (newStreak === 30) {
      reward = 1000;
    }
  } else if (lastLogin === today) {
    // Already logged in today, no reward
    return;
  }

  const newBalance = balance + reward;

  try {
    await updateDoc(userRef, {
      loginStreak: newStreak,
      lastLoginDate: today,
      balance: newBalance
    });

    setUserData((prev) => ({
      ...prev,
      loginStreak: newStreak,
      lastLoginDate: today,
      balance: newBalance
    }));

    toast.success(
      `🔥 Login Streak Bonus! You've earned $${reward}. (Streak: ${newStreak} day${newStreak > 1 ? 's' : ''})`
    );
  } catch (err) {
    console.error('Error updating login streak:', err);
  }
}
