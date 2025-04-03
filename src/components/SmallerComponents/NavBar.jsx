import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon,UserCircleIcon, FireIcon,BanknotesIcon } from '@heroicons/react/24/outline';
import { signOut } from 'firebase/auth';
import { auth } from "../../../firebase";
import { useUser } from '../../context/UserContext';
import logo from '../../assets/images/apst.png';
import Search from './Search';
import { toast } from 'react-toastify';

function NavBar({ setOpen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();

  const navigation = userData
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'News', href: '/news' },
        { name: 'Transactions', href: '/transactions' },
        { name: 'Update Profile', href: '/profile' },
      ]
    : [];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      toast.success("You've been logged out");
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  return (
    <header className="fixed inset-x-0 sm:top-0 max-sm:bottom-0 z-50 text-lg">
      <nav
        aria-label="Global"
        className="flex dark:bg-black/10 bg-white/10 backdrop-blur-3xl items-center justify-between max-md:px-6 max-md:h-15 md:px-8"
      >
        <div className="flex-col lg:flex-1 dark:text-white">
          <Link to="/" className="-m-1.5 p-1.5">
            <img
              alt=""
              src={logo}
              className="h-15 max-sm:h-10 w-auto dark:invert"
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
        {userData && (<>
        
          <span className="ml-2 text-orange-500 flex gap-1 items-center font-semibold">
          <FireIcon className="h-5 w-5"/> {userData.loginStreak}
        </span>
  <span className="text-sm text-gray-900 dark:text-white px-3 flex justify-self-center items-center">
    <UserCircleIcon className="h-8 w-8 text-black dark:text-white pr-1" /> {userData.username?.toUpperCase()} <BanknotesIcon className="h-7 w-7 px-1 text-green-600" /> ${userData.balance?.toLocaleString() || 0}
  </span></>
)}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12 justify-center items-center">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setActiveTab(item.name)}
              className={({ isActive }) =>
                `text-lg font-semibold ${
                  isActive
                    ? 'text-blue-500 dark:text-blue-500'
                    : 'dark:text-white text-gray-900'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
          <div className="pl-3">
          {userData && <Search />}
          </div>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4 pr-9">
          {userData ? (
            <>
            <span className="ml-2 text-orange-500 font-semibold flex justify-center">
    <FireIcon className="h-6 w-6" /> {userData.loginStreak}
  </span>
              <span className="text-sm text-gray-900 dark:text-white flex items-center justify-between">
                <UserCircleIcon className="h-8 w-8" /> {userData.username.toUpperCase()} <BanknotesIcon className="h-8 w-8 ml-3" /> ${userData.balance?.toLocaleString() || 0}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Log out
              </button>
            </>
          ) : (
            <a
              href="#"
              className="text-sm/6 font-semibold text-gray-900 dark:text-white"
              onClick={() => setOpen(true)}
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5"onClick={() => setMobileMenuOpen(false)}>
              <img alt="" src={logo} className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="pt-6">
          {userData && <Search />}
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `-mx-3 block rounded-lg px-3 py-2 text-lg font-semibold ${
                        isActive
                          ? 'text-blue-500 dark:text-blue-500'
                          : 'text-gray-900'
                      }`
                    }
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveTab(item.name);
                    }}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
              <div className="py-6">
                {userData ? (
                  <>
                    <p className="text-sm font-medium text-gray-700">
                      <UserCircleIcon className="h-8 w-8" /> {userData.username} | <BanknotesIcon className="h-8 w-8" /> £{userData.balance?.toLocaleString() || 0}
                    </p>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="-mx-3 mt-2 block rounded-lg px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50"
                    onClick={() => {
                      setOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Log in
                  </a>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}

export default NavBar;
