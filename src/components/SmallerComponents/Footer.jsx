import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-5 px-6  md:z-10 max-sm:pb-20 bottom-0 w-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
        {/* Left section */}
        <div className="text-center md:text-left">
          <p className="font-semibold text-gray-800 dark:text-white">© {new Date().getFullYear()} AP Stock Trader</p>
          <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
            All stock data is fetched via third-party APIs and may be delayed. Trading is simulated and for educational purposes only. No real money is involved.
          </p>
        </div>

        {/* Right section */}
        <div className="flex flex-wrap justify-center md:justify-end gap-4">
          <Link to="/faq" className="hover:underline hover:text-blue-500">
            FAQ
          </Link>
          {/* <Link to="/about" className="hover:underline hover:text-blue-500">
            About
          </Link> */}
          <a
            href="https://github.com/atikp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-blue-500"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}