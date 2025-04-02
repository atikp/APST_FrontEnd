import { useState,useEffect } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel
} from '@headlessui/react';
import { CurrencyDollarIcon, ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import Video from './SmallerComponents/Video';
import chart from '../assets/images/chart-8305514_1280.jpg';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function HomePagePublic({ open, setOpen, openSignUp, setOpenSignUp }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    alphaKey: '',
    finnhubKey: '',
    fmpKey: '',
  });
  const [keysValid, setKeysValid] = useState(false);
  const [keysLoading, setKeysLoading] = useState(false);
  const { setUserData } = useUser();
  const navigate = useNavigate();
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [hideArrow, setHideArrow] = useState(false);

useEffect(() => {
  const target = document.getElementById('stepByStep');
  if (!target) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      setHideArrow(entry.isIntersecting);
    },
    { threshold: 0.1 }
  );

  observer.observe(target);

  return () => {
    observer.unobserve(target);
  };
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestKeys = async () => {
    const { alphaKey, finnhubKey, fmpKey } = formData;
    setKeysLoading(true);
    setKeysValid(false);
    try {
      const alphaRes = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=tesco&apikey=${alphaKey}`);
      const finnhubRes = await fetch(`https://finnhub.io/api/v1/search?q=apple&exchange=US&token=${finnhubKey}`);
      const fmpRes = await fetch(`https://financialmodelingprep.com/stable/search-symbol?query=AAPL&apikey=${fmpKey}`);

      const alphaJson = await alphaRes.json();
      const finnhubJson = await finnhubRes.json();
      const fmpJson = await fmpRes.json();

      const alphaOk = alphaJson.bestMatches?.length > 0;
      const finnhubOk = finnhubJson.count > 0;
      const fmpOk = Array.isArray(fmpJson) && fmpJson.length > 0;

      if (alphaOk && finnhubOk && fmpOk) {
        setKeysValid(true);
        toast.success('✅ API Keys are valid!');
      } else {
        toast.error('❌ One or more keys are invalid. Please check them.');
      }
    } catch (err) {
      console.error('API key test failed:', err);
      toast.error('❌ Failed to validate API keys.');
    } finally {
      setKeysLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!keysValid) {
      toast.error('Please validate your API keys before signing up.');
      return;
    }

    const {
      email,
      password,
      confirmPassword,
      username,
      alphaKey,
      finnhubKey,
      fmpKey,
    } = formData;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        balance: 10000,
        apiKeys: {
          fmp: fmpKey,
          alphaVantage: alphaKey,
          finnhub: finnhubKey,
        },
        FirstTime: [], 

        stockList: ['AAPL', 'IBM', 'AMZN', 'WBD'], // up to 10

        transactions: {
          buy: [],
          sell: [],
          balance: 10000, // this will mirror the main balance initially
        },

        holdings: [], // stock objects to be added later after purchase

        createdAt: new Date(),
      });

      toast.success('Account created! Welcome to the APST Family');
      setTimeout(() => navigate('/dashboard'), 150);
      setOpenSignUp(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        alphaKey: '',
        finnhubKey: '',
        fmpKey: '',
      }); // Optional: reset form
    } catch (error) {
      console.error('Signup error:', error.message);
      toast.error('Something went wrong: ' + error.message);
    }
  };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const toastAndRedirect = async (message, path) => {
    toast.success(message);
    await sleep(150); // wait 150ms before redirect
    navigate(path);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
  
    if (!resetEmail) {
      toast.error('Please enter an email address.');
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent!');
      setShowResetPrompt(false);
    } catch (error) {
      console.error('Password reset error:', error.message);
      toast.error('Failed to send reset email: ' + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user data from Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserData({ ...userData, uid: user.uid });
        toastAndRedirect('Welcome Back!', '/dashboard');

      } else {
        console.log('No such document!');
        toast.error('Something went wrong fetching user data.');
      }

      setOpen(false); // Close the login modal
    } catch (error) {
      console.error('Login failed:', error.message);
      toast.error('Login failed: ' + error.message);
    }
  };

  return (
    <main>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0 ">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white dark:bg-black py-10 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-0 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95 "
            >
              <div className="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h1 className="text-black dark:text-white text-2xl pb-5">
                  Login
                </h1>
                <form
                  className="space-y-4 dark:bg-black"
                  onSubmit={handleLogin}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Your email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Your password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex justify-between">
                  <button
  type="button"
  className="text-sm text-blue-700 hover:underline dark:text-blue-500"
  onClick={() => {
    const emailInput = document.getElementById('email');
    setResetEmail(emailInput?.value || '');
    setShowResetPrompt(true);
  }}
>
  Lost Password?
</button>
{showResetPrompt && (
  <div className="mt-3 space-y-2">
    <label
      htmlFor="resetEmail"
      className="block text-sm font-medium text-gray-900 dark:text-white"
    >
      Enter your email to reset password
    </label>
    <input
      type="email"
      id="resetEmail"
      name="resetEmail"
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      value={resetEmail}
      onChange={(e) => setResetEmail(e.target.value)}
      required
    />
    <div className="flex justify-between">
      <button
        type="button"
        className="text-sm text-green-600 hover:underline"
        onClick={handlePasswordReset}
      >
        Send Reset Email
      </button>
      <button
        type="button"
        onClick={() => setShowResetPrompt(false)}
        className="text-sm text-red-500 hover:underline"
      >
        Cancel
      </button>
    </div>
  </div>
)}
                  </div>
                  <button
                    type="submit"
                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Login to your account
                  </button>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Not registered?{' '}
                    <a
                      href="#"
                      className="text-blue-700 hover:underline dark:text-blue-500"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenSignUp(true);
                        setOpen(false);
                      }}
                    >
                      Create account
                    </a>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={openSignUp}
        onClose={setOpenSignUp}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white dark:bg-black py-10 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h1 className="text-black dark:text-white text-2xl pb-5">
                  Sign Up
                </h1>
                <form
                  className="space-y-4 dark:bg-black"
                  onSubmit={handleSignUpSubmit}
                >
                  <div>
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      User Name
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Your email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Your password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Confirm password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      required
                    />
                  </div>
                  <div className="api-keys">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="finnhubKey"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        FinnHub key
                      </label>
                      <div className="mt-2">
                        <input
                          id="finnhubKey"
                          name="finnhubKey"
                          type="text"
                          value={formData.finnhubKey}
                          onChange={handleChange}
                          autoComplete=""
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          required
                        />
                      </div>
                      <a
                        target="_blank"
                        href="https://finnhub.io/register"
                        className="text-blue-500"
                      >
                        Get Finnhub Key
                      </a>
                    </div>
                    <div className="sm:col-span-3 mt-2">
                      <label
                        htmlFor="alphaKey"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Alpha Vantage key
                      </label>
                      <div className="mt-2">
                        <input
                          id="alphaKey"
                          name="alphaKey"
                          type="text"
                          value={formData.alphaKey}
                          onChange={handleChange}
                          autoComplete=""
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                          required
                        />
                      </div>
                      <a
                        target="_blank"
                        href="https://www.alphavantage.co/support/#api-key"
                        className="text-blue-500"
                      >
                        Get Alpha Vantage Key
                      </a>
                    </div>
                    <div className="sm:col-span-3 mt-2">
                      <label
                        htmlFor="fmpKey"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Finance Modeling Prep
                      </label>
                      <div className="mt-2">
                        <input
                          id="fmpKey"
                          name="fmpKey"
                          type="text"
                          value={formData.fmpKey}
                          onChange={handleChange}
                          autoComplete=""
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white "
                          required
                        />
                      </div>
                      <a
                        target="_blank"
                        href="https://site.financialmodelingprep.com/register"
                        className="text-blue-500"
                      >
                        Get Finance Modeling Prep Vantage Key
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
  <button
    type="button"
    onClick={handleTestKeys}
    disabled={keysLoading}
    className={`text-sm px-4 py-2 rounded-md ${
      keysLoading 
        ? 'bg-gray-400 text-white cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }`}
  >
    {keysLoading  ? 'Testing...' : 'Test API Keys'}
  </button>

  <div className="relative group">
    <span className="text-gray-400 cursor-pointer text-lg">ℹ️</span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-md bg-black text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
      Testing your keys ensures they work before account creation. Required to fetch live stock data.
    </div>
  </div>
</div>
    {keysValid && <span className="text-green-500 font-medium">✔ Keys valid</span>}
  </div>

  <button
    type="submit"
    disabled={!keysValid}
    className={`w-full text-white ${keysValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400'} focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-800`}
  >
    Create Account
  </button>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Already registered?{' '}
                    <a
                      href="#"
                      className="text-blue-700 hover:underline dark:text-blue-500"
                      onClick={() => {
                        setOpen(true);
                        setOpenSignUp(false);
                      }}
                    >
                      Back to Login
                    </a>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <section>
        <div className="bg-white dark:bg-black h-dvh justify-center items-center flex">
          <div className="relative isolate px-6 pt-14 lg:px-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              />
            </div>
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
              <Video />
              <div className="text-center">
                <h1 className="text-5xl font-bold tracking-tight text-balance text-white sm:text-7xl ">
                  Play your stocks right
                </h1>
                <p className="mt-8 text-lg font-semibold text-pretty text-white sm:text-xl/8">
                  This is your Playground. Take the steps necessary to make your
                  $10,000 work for you
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="#"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => setOpen(true)}
                  >
                    Get started
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
  {!hideArrow && (
    <button
      onClick={() =>
        document.getElementById('stepByStep')?.scrollIntoView({ behavior:"smooth"})
      }
      className="animate-bounce"
      aria-label="Scroll down"
    >
      <ChevronDoubleDownIcon className="h-8 w-8 text-white opacity-80 hover:opacity-100 transition-opacity" />
    </button>
  )}
</div>

            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-60 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="stepByStep" className="text-gray-600 dark:text-white dark:bg-black body-font flex flex-row justify-center items-center">
        <div className="container px-5 py-24 mx-auto flex flex-wrap">
          <div className="flex flex-wrap items-center w-full">
            <div className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6 flex-row ">
              <div className="flex relative pb-5">
                <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white relative z-10">
                  <CurrencyDollarIcon />
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 dark:text-white mb-1 tracking-wider">
                    STEP 1
                  </h2>
                  <p className="leading-relaxed">
                    Upon SignUp you will receive $10,000 to purchase stocks in
                    the US Stock market. See how much you can make. who knows,
                    you might even get a gold star <span title="Gold Star!">🌟</span>
                  </p>
                </div>
              </div>
              <div className="flex relative pb-5">
                <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white relative z-10">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 dark:text-white mb-1 tracking-wider">
                    STEP 2
                  </h2>
                  <p className="leading-relaxed">
                    Take a look around at all the available information about
                    the stock market. The news tab and the search function at
                    the top will help you out with that.
                  </p>
                </div>
              </div>
              <div className="flex relative pb-5">
                <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white relative z-10">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="5" r="3"></circle>
                    <path d="M12 22V8M5 12H2a10 10 0 0020 0h-3"></path>
                  </svg>
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 dark:text-white mb-1 tracking-wider">
                    STEP 3
                  </h2>
                  <p className="">
                    Search the stocks you want to keep an eye on and add them to
                    the list provided for you on your Dashboard homepage
                  </p>
                </div>
              </div>
              <div className="flex relative pb-5">
                <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white relative z-10">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 dark:text-white mb-1 tracking-wider">
                    STEP 4
                  </h2>
                  <p className="leading-relaxed">
                    Buy and sell your stocks as you please. Keep an eye out on
                    the market and use the company search to view the company's
                    historical information via charts and company information.
                    The news tab will help you decide what to do with your
                    current stocks.<br/> <strong className='text-red-500'>Real data, simulated trades. Learn without risk!</strong>
                  </p>
                </div>
              </div>
              <div className="flex relative">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white relative z-10">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 dark:text-white mb-1 tracking-wider">
                    FINISH
                  </h2>
                  <p className="leading-relaxed">
                    Watch as your money grows and view all of your transactions
                    in the transactions tab. enjoy the experience.<br/> NB: If you do go broke don't worry, you can always start fresh from the UPDATE PROFILE page.(Check it out)
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col place-self-center gap-x-6">
                <h2 className="text-2xl mb-3">BEFORE YOU START</h2>
                <p>
                  Since this app is completely FREE to use, there are 3 things I
                  need for you to do before signing up.
                </p>
                <p>
                  {' '}
                  This app uses data from the following websites in order to
                  provide the information shown to you. please sign up and get
                  the API keys from them. <strong className='text-red-500'>To protect your data and stay within API usage limits, each user needs their own free API keys.</strong> it should only take you a couple of
                  minutes to achieve this.
                </p>
                <ul className="my-5 ">
                  <li>
                    {' '}
                    <a
                      target="_blank"
                      href="https://finnhub.io/register"
                      className="text-blue-500"
                    >
                      Get Finnhub Key
                    </a>
                  </li>
                  <li>
                    {' '}
                    <a
                      target="_blank"
                      href="https://www.alphavantage.co/support/#api-key"
                      className="text-blue-500"
                    >
                      Get Alpha Vantage Key
                    </a>
                  </li>
                  <li>
                    {' '}
                    <a
                      target="_blank"
                      href="https://site.financialmodelingprep.com/register"
                      className="text-blue-500"
                    >
                      Get Finance Modeling Prep Vantage Key
                    </a>
                  </li>
                </ul>
                <p>
                  After you get these keys place them in the dedicated boxes in
                  the signUp form
                </p>
                <p className="text-red-500 mt-2">
                  WARNING! this app will not work if the keys are not present in
                  the correct boxes
                </p>
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 mt-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => setOpenSignUp(true)}
                >
                  Get started
                  {/* login link */}
                </a>
              </div>
            </div>
            <img
              className="lg:w-3/5 md:w-1/2 max-md:hidden object-cover object-center overflow-hidden rounded-lg md:mt-0 mt-12 shadow-lg shadow-blue-500/10"
              src={chart}
              alt="step"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
