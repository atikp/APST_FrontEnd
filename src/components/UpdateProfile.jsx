import { useState, useEffect,useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { toast } from 'react-toastify';
import { deleteUser, updatePassword } from 'firebase/auth';
import ConfirmModal from './SmallerComponents/ConfirmModal';
import AccoladesDisplay from '../components/SmallerComponents/AccoladesDisplay';


function UpdateProfile() {
  const { userData, setUserData } = useUser();
  const [finnhubKey, setFinnhubKey] = useState('');
  const [alphaKey, setAlphaKey] = useState('');
  const [fmpKey, setFmpKey] = useState('');
  const [stockList, setStockList] = useState(userData?.stockList || []);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const location = useLocation();
  const watchlistRef = useRef(null);

  useEffect(() => {
    if (location.state?.scrollTo === 'watchlist') {
      setTimeout(() => {
        const element = document.getElementById('watchlist-section');
        if (element) {
          const offsetTop = element.getBoundingClientRect().top + window.scrollY;
          const adjustedOffset = offsetTop - 80; // navbar height offset
          window.scrollTo({ top: adjustedOffset, behavior: 'smooth' });
        }
      }, 300); // Delay allows layout/render to complete
    }
  }, [location]);

  useEffect(() => {
    if (userData) {
      setFinnhubKey(userData.apiKeys?.finnhub || '');
      setAlphaKey(userData.apiKeys?.alphaVantage || '');
      setFmpKey(userData.apiKeys?.fmp || '');
      setStockList(userData.stockList || Array(10).fill(''));
      setEmail(userData.email || '');
      setUsername(userData.username || '');
    }
  }, [userData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userData?.uid) return toast.error("User not logged in");

    const updatedData = {
      apiKeys: {
        finnhub: finnhubKey,
        alphaVantage: alphaKey,
        fmp: fmpKey,
      },
      stockList: stockList.slice(0, 10),
      username,
    };

    try {
      await updateDoc(doc(db, 'users', userData.uid), updatedData);
      setUserData((prev) => ({ ...prev, ...updatedData }));
      if (updatedData.stockList?.length > 0 && !userData?.FirstTime?.includes("firstWatchlistAdd")) {
        try {
          const userRef = doc(db, "users", userData.uid);
          await updateDoc(userRef, {
            FirstTime: arrayUnion("firstWatchlistAdd"),
          });
      
          setUserData((prev) => ({
            ...prev,
            FirstTime: [...(prev.FirstTime || []), "firstWatchlistAdd"],
          }));
      
          toast.success("👀 Achievement Unlocked: First Stock Added to Watchlist!");
        } catch (err) {
          console.error("Error updating FirstTime array for watchlist:", err);
        }
      }
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          return toast.error("Passwords do not match");
        }
        if (newPassword.length < 6) {
          return toast.error("Password must be at least 6 characters");
        }
      
        try {
          await updatePassword(auth.currentUser, newPassword);
          toast.success("Password updated successfully!");
        } catch (err) {
          console.error("Password update error:", err);
          return toast.error("Password update failed. Please re-authenticate and try again.");
        }
      }

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile.');
    }
  };

  const handleConfirm = async () => {
    setModalOpen(false);
    if (!userData?.uid) return toast.error("User not logged in");

    try {
      if (modalType === 'reset') {
        await updateDoc(doc(db, 'users', userData.uid), {
          balance: 10000,
          holdings: [],
          transactions: [],
          FirstTime: [],
        });
        toast.success("Account reset to default!");
      } else if (modalType === 'delete') {
        await deleteDoc(doc(db, 'users', userData.uid));
        await deleteUser(auth.currentUser);
        toast.success("Account deleted.");
      }
    } catch (err) {
      console.error(`${modalType} error:`, err);
      toast.error(`Failed to ${modalType} account.`);
    }
  };

  return (
    <main>
      <div className="bg-white dark:bg-black pb-30 min-h-dvh">
        <div className="relative isolate px-2 pt-14 lg:px-8">
          <h1 className="mb-10 flex self-center place-self-center z-50 text-6xl dark:text-white">
            User Profile
          </h1>
          <AccoladesDisplay accolades={userData?.FirstTime || []} userData={userData}/>
          
          <form className="p-10 " onSubmit={handleSave}>
            <div className="form-wrapper space-y-12">
              <section className="api-keys border-b border-gray-900/10 pb-12">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">API Keys</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="finnhub-key" className="block text-xl font-medium text-gray-900 dark:text-white">
                      FinnHub Key
                    </label>
                    <input
                      id="finnhub-key"
                      type="text"
                      value={finnhubKey}
                      onChange={(e) => setFinnhubKey(e.target.value)}
                      className="w-full mt-1 rounded-md bg-white px-3 py-2 text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-300 focus:outline-indigo-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="alpha-key" className="block text-xl font-medium text-gray-900 dark:text-white">
                      Alpha Vantage Key
                    </label>
                    <input
                      id="alpha-key"
                      type="text"
                      value={alphaKey}
                      onChange={(e) => setAlphaKey(e.target.value)}
                      className="w-full mt-1 rounded-md bg-white px-3 py-2 text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-300 focus:outline-indigo-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="fmp-key" className="block text-xl font-medium text-gray-900 dark:text-white">
                      Financial Modeling Prep
                    </label>
                    <input
                      id="fmp-key"
                      type="text"
                      value={fmpKey}
                      onChange={(e) => setFmpKey(e.target.value)}
                      className="w-full mt-1 rounded-md bg-white px-3 py-2 text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-300 focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </section>

              <section ref={watchlistRef} className="watched-stocks border-b border-gray-900/10 pb-12" id="watchlist-section">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Your Stocks</h2>
                <div className="mt-6 flex flex-wrap gap-4">
                  {stockList.map((stock, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="XMPL"
                        value={stock}
                        onChange={(e) => {
                          const updatedList = [...stockList];
                          updatedList[index] = e.target.value.toUpperCase();
                          setStockList(updatedList);
                        }}
                        className="w-28 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = stockList.filter((_, i) => i !== index);
                          setStockList(updatedList);
                        }}
                        className="text-red-500 font-bold text-xl hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (stockList.length < 10) {
                        setStockList([...stockList, ""]);
                      }
                    }}
                    disabled={stockList.length >= 10}
                    className={`rounded-md px-4 py-2 mt-2 font-semibold ${
                      stockList.length >= 10
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    + Add Stock
                  </button>
                </div>
              </section>

              <section className="personal-info border-b border-gray-900/10 pb-12">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-10">
                  <div className="sm:col-span-6">
                    <label htmlFor="username" className="block text-xl font-medium text-gray-900 dark:text-white">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-xl"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-xl font-medium text-gray-900 dark:text-white">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      readOnly
                      autoComplete="email"
                      className="mt-2 block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-500 outline-1 outline-gray-300 sm:text-xl cursor-not-allowed"
                    />
                  </div>
                </div>
              </section>

              <section className="border-b border-gray-900/10 pb-12">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Reset Password</h2>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className="rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className="rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                  />
                </div>
                {passwordError && (
  <p className="mt-2 text-red-500 text-sm">{passwordError}</p>
)}
              </section>

              <section className="border-b border-gray-900/10 pb-12">
                <h2 className="text-3xl font-semibold text-red-700 dark:text-red-500">Danger Zone</h2>
                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('reset');
                      setModalOpen(true);
                    }}
                    className="w-full rounded-md bg-yellow-500 px-4 py-2 font-semibold text-white hover:bg-yellow-600"
                  >
                    Reset Account (Balance, Holdings, Transactions)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('delete');
                      setModalOpen(true);
                    }}
                    className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    Delete My Account Permanently
                  </button>
                </div>
              </section>

              <div className="mt-6 flex place-items-center justify-center gap-x-6">
                <button
                  type="button"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        title={modalType === 'delete' ? 'Delete Account' : 'Reset Account'}
        description={
          modalType === 'delete'
            ? 'Are you sure you want to permanently delete your account? This action cannot be undone.'
            : 'Are you sure you want to reset your account? This will clear your balance, holdings, and transactions.'
        }
      />
    </main>
  );
}

export default UpdateProfile;