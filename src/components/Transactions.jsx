import { useState, useEffect, useRef } from 'react';
import HoldingsCard from './SmallerComponents/HoldingsCard';
import SearchToBuy from './SmallerComponents/SearchToBuy';
import SearchToBuyResult from './SmallerComponents/SearchToBuyResult';
import ForexFetch from './SmallerComponents/ForexFetch';
import { useUser } from '../context/UserContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function Transactions() {
  const { userData } = useUser();
  const [searchedCompany, setSearchedCompany] = useState(null);
  const [conversionRate, setConversionRate] = useState(1);
  const [currencyList, setCurrencyList] = useState();
  const [convertChoice, setConvertChoice] = useState({
    from: 'usd',
    to: 'usd',
  });
  const [transactions, setTransactions] = useState([]);
  const [showCompanyCard, setShowCompanyCard] = useState(true);
  const holdingsRef = useRef(null);
  const location = useLocation();
  const tradeSymbol = location.state?.symbol;
  const [currentPage, setCurrentPage] = useState(1);


  const allTransactions = [
    ...(userData?.transactions?.buy || []).map((t) => ({ ...t, type: 'Buy' })),
    ...(userData?.transactions?.sell || []).map((t) => ({
      ...t,
      type: 'Sell',
    })),
  ];

  // Sort newest first
  const sortedTransactions = allTransactions.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Pagination
  const transactionsPerPage = 10;
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(
    indexOfFirst,
    indexOfLast
  );

  useEffect(() => {
    if (tradeSymbol) {
      setSearchedCompany(tradeSymbol);
      setShowCompanyCard(true);

      // Delay to ensure the element has rendered
      setTimeout(() => {
        const element = document.getElementById('search-result');
        if (element) {
          const offsetTop =
            element.getBoundingClientRect().top + window.scrollY;
          const adjustedOffset = offsetTop - 100; // Adjust this as needed for your navbar height
          window.scrollTo({ top: adjustedOffset, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [tradeSymbol]);

  useEffect(() => {
    if (!userData) return;
    const buy = userData.transactions?.buy || [];
    const sell = userData.transactions?.sell || [];

    const combined = [
      ...buy.map((t) => ({ ...t, type: 'Buy' })),
      ...sell.map((t) => ({ ...t, type: 'Sell' })),
    ];
    const sorted = combined.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(sorted);
  }, [userData]);

  return (
    <main className="main">
      <div className="bg-white dark:bg-black pb-20 min-h-full">
        <div className="relative isolate px-2 pt-14 lg:px-8">
          <h1 className="mx-10 mb-10 flex self-center place-self-center z-50 text-6xl max-md:text-5xl dark:text-white">
            Portfolio
          </h1>

          <div className="tools flex max-md:flex-col gap-20 justify-center">
            <div className="to-buy flex flex-col justify-start items-start">
              <p className="pb-5 text-gray-700 dark:text-white text-2xl w-[300px]">
                Search below to get current stock price to purchase new Stock to buy:
              </p>
              <SearchToBuy
                setSearchedCompany={(company) => {
                  setSearchedCompany(company);
                  setShowCompanyCard(true); //  ensures card is visible again
                }}
              />
              <AnimatePresence>
                {searchedCompany && showCompanyCard && (
                  <motion.div
                    key={searchedCompany}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    id="search-result"
                  >
                    <SearchToBuyResult
                      searchedSymbol={searchedCompany}
                      setShowCompanyCard={setShowCompanyCard}
                      scrollToHoldings={() =>
                        holdingsRef.current?.scrollIntoView({
                          behavior: 'smooth',
                        })
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative forex flex flex-col justify-start items-center h-50 max-w-150">
              <form className="max-w-sm mx-auto">
                <label
                  htmlFor="currencyList"
                  className="block mb-2 text-lg font-medium text-gray-900 dark:text-white"
                >
                  USD Currency converter:
                </label>
                <select
                  onChange={(e) =>
                    setConvertChoice({ ...convertChoice, from: e.target.value })
                  }
                  id="currencyList"
                  className="relative bg-gray-50 border border-gray-300 text-gray-900 text-2xl rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
                  <option value="usd">Currency from</option>
                  {currencyList?.map((currencyOption) => (
                    <option
                      key={currencyOption.code}
                      value={currencyOption.code}
                    >
                      {currencyOption.name || 'Unnamed'}
                    </option>
                  ))}
                </select>
              </form>
              <ForexFetch
                symbolFrom={convertChoice.from}
                symbolTo={convertChoice.to}
                setConversionRate={setConversionRate}
                setCurrencyList={setCurrencyList}
              />
              <p className="text-white">
                Conversion Rate: USD ${conversionRate}
              </p>
            </div>
          </div>

          <div className="holdings-cards" ref={holdingsRef}>
            <h1 className="dark:text-white text-3xl max-md:text-xl place-self-start p-5">
              Current Holdings
            </h1>
            <div className="newsCards flex flex-wrap gap-20 justify-center items-center mt-5">
              {userData?.holdings
                ?.filter((h) => h.amountOfStock > 0)
                .map((holding) => (
                  <HoldingsCard key={holding.symbol} holding={holding} />
                ))}
            </div>
          </div>

          <h1 className="dark:text-white text-center text-2xl m-10">
            Transactions
          </h1>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-sm:max-w-dvw">
            <table className="w-full max-md:text-xs md:text-xl rtl:text-right text-gray-700 dark:text-gray-300">
              <thead className="text-xl text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
                <tr>
                  <th className="px-2 py-3 text-center">Stock</th>
                  <th className="px-2 py-3 text-center">Type</th>
                  <th className="px-2 py-3 text-center">Price</th>
                  <th className="px-2 py-3 text-center">Date</th>
                  <th className="px-2 py-3 text-center">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((tx, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      tx.type === 'Buy'
                        ? 'bg-green-500 dark:bg-green-800'
                        : 'bg-red-500 dark:bg-red-600'
                    } border-b  border-gray-200 shadow-inner shadow-gray-400/50`}
                  >
                    <td className="px-2 py-4 text-center font-medium text-gray-900 dark:text-white">
                      <div>
                        <p className="font-semibold">{tx.stockName}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{tx.symbol}</p>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-center font-semibold">
                      {tx.type} {tx.type === 'Buy' ? '↑' : '↓'}
                    </td>
                    <td className="px-2 py-4 text-center max-sm:font-bold">
                      {Number(tx.price).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </td>
                    <td className="px-2 py-4 text-center">
                      {new Date(tx.date).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-2 py-4 text-center max-sm:font-bold">
                      {tx.balance
                        ? Number(tx.balance).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center gap-2 mt-4">
              {Array.from(
                {
                  length: Math.ceil(
                    sortedTransactions.length / transactionsPerPage
                  ),
                },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 mb-5 rounded-md ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Transactions;
