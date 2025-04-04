import { Routes, Route, useLocation } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { useState, useEffect, useLayoutEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from './context/UserContext';
import { checkBalanceMilestones } from './hooks/UseAccolades.jsx';
import { handleLoginStreak } from './hooks/useLoginStreak.jsx';

import HomePagePublic from './components/HomePagePublic';
import News from './components/News';
import Transactions from './components/Transactions';
import UpdateProfile from './components/UpdateProfile';
import CompanyInfo from './components/CompanyInfo';
import DashBoard from './components/DashBoard';
import NavBar from './components/SmallerComponents/NavBar';
import NotFound from './components/NotFound';
import StockTicker from './components/SmallerComponents/TickerTape.jsx';
import FAQPage from './components/FAQ.jsx';
import Footer from './components/SmallerComponents/Footer.jsx';


export default function App() {
  let theme = 'light';
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [CompanyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const { userData: firebaseUserData } = useUser();
  const UserSymbols = firebaseUserData?.stockList || [];



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fullUserData = { ...data, uid: user.uid };

          setUserData(fullUserData);
  
          // Move streak and balance milestone checks here
          await handleLoginStreak(fullUserData, setUserData);
          await checkBalanceMilestones(fullUserData, setUserData);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
   
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://raw.githubusercontent.com/atikp/stockFetcher/main/all_full_tickers.json'
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        sessionStorage.setItem('companyFallback', JSON.stringify(jsonData));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (window.matchMedia('(prefers-color-shcheme:dark')) {
    theme = 'dark';
  }

  const Wrapper = ({ children }) => {
    const location = useLocation();

    useLayoutEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.pathname]);

    return children;
  };
  return (
    <Wrapper>
      <NavBar
        setOpen={setLoginOpen}
        currentUser={currentUser}
        userData={userData}
      />
      <StockTicker />
      
      <Routes>
        <Route path='/FAQ' element={<FAQPage />}/>
        <Route
          path="/"
          element={
            <HomePagePublic
              setOpen={setLoginOpen}
              open={loginOpen}
              openSignUp={signupOpen}
              setOpenSignUp={setSignupOpen}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute user={currentUser}>
              <DashBoard PROPSYMBOLS={UserSymbols} />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute user={currentUser}>
              <UpdateProfile PROPSYMBOLS={UserSymbols} />
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <PrivateRoute user={currentUser}>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/news"
          element={
            <PrivateRoute user={currentUser}>
              <News />
            </PrivateRoute>
          }
        />

        <Route
          path="/company/:symbol"
          element={
            <PrivateRoute user={currentUser}>
              <CompanyInfo />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer/>
    </Wrapper>
  );
}
