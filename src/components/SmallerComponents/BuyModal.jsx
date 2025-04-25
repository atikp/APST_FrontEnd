import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-toastify';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { API_BASE } from "../../utils/api";

const BuyModal = ({ symbol, onClose, scrollToHoldings }) => {
  const [searchedCompany, setSearchedCompany] = useState(null);
  const [logoUrl, setLogoUrl] = useState();
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [isBuying, setIsBuying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [expired, setExpired] = useState(false);
  const { userData, setUserData } = useUser();
  const canAfford = totalPrice <= (userData?.balance ?? 0);
  const canBuy = !expired && canAfford && amount > 0 && !isBuying;

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/nasdaq/quote/${symbol}`);
        const data = await response.json();
        setSearchedCompany(data.data);
      } catch (err) {
        console.error('Error fetching company data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchCompanyData();
      setLogoUrl(
        `https://raw.githubusercontent.com/atikp/stockFetcher/refs/heads/main/icons/stock_icons/${symbol}.png`
      );
    }
  }, [symbol]);

  // Countdown Timer
  useEffect(() => {
    if (loading || expired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, expired]);
  const refreshQuote = async () => {
    if (!symbol) return;
    setExpired(false);
    setTimeLeft(10);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/nasdaq/quote/${symbol}`);
      const data = await response.json();
      setSearchedCompany(data.data);
    } catch (err) {
      console.error('Error refreshing price:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    if (searchedCompany?.primaryData?.lastSalePrice) {
      const pricePerShare = Number(
        searchedCompany.primaryData.lastSalePrice.replace(/[$,]/g, '')
      );
      setTotalPrice(value * pricePerShare);
    }
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    if (!canBuy || !amount || !totalPrice) return;

    try {
      setIsBuying(true);
      const uid = userData?.uid;
      const stockName = searchedCompany?.companyName;
      const pricePurchasedAt = Number(
        searchedCompany?.primaryData?.lastSalePrice?.replace(/[$,]/g, '')
      );

      const res = await fetch(`${API_BASE}/api/trade/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          symbol,
          stockName,
          pricePurchasedAt,
          amountOfStock: Number(amount),
          totalPriceAtPurchase: totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Purchase failed');

      setUserData((prev) => ({
        ...prev,
        balance: data.newBalance,
        holdings: data.holdings,
        transactions: data.transactions,
      }));

      if (!userData?.FirstTime?.includes('firstBuy')) {
        try {
          const userRef = doc(db, 'users', userData.uid);
          await updateDoc(userRef, {
            FirstTime: arrayUnion('firstBuy'),
          });

          setUserData((prev) => ({
            ...prev,
            FirstTime: [...(prev.FirstTime || []), 'firstBuy'],
          }));

          toast.success('🏅 Achievement Unlocked: First Stock Purchase!');
        } catch (err) {
          console.error('Error updating accolades:', err);
        }
      }

      toast.success(`Purchased ${amount} shares of ${symbol}`);
      if (scrollToHoldings) scrollToHoldings();
      if (onClose) onClose();

      setAmount('');
      setTotalPrice(0);
    } catch (err) {
      console.error('Error during purchase:', err);
      toast.error(err.message || 'Purchase failed. Try again.');
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) return <p className="text-white">Loading company data...</p>;
  if (!searchedCompany)
    return <p className="text-white">No company data found.</p>;

  const progressWidth = `${(timeLeft / 10) * 100}%`;

  return (
    <div className="relative max-w-sm w-70 bg-gray-200 dark:bg-gray-900 dark:text-white rounded-xl shadow-lg p-5 flex">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-red-500 font-bold text-lg"
      >
        ✕
      </button>
      <div className="w-1/3 flex flex-col items-center">
        <img
          src={logoUrl}
          alt="Logo"
          className="w-20 h-20 object-contain mb-3"
        />
        <p className="mt-3">
          Total:{' '}
          {totalPrice.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>
      </div>
      <div className="w-2/3 pl-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold">{searchedCompany.companyName}</h3>
          <p className="text-sm text-gray-400">{symbol}</p>
        </div>

        <div className="mb-2">
          <div className="relative w-full bg-gray-300 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
            <div
              className={`bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out`}
              style={{ width: progressWidth }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
            {expired
              ? 'Price quote expired. Please refresh to continue.'
              : `Live quote expires in ${timeLeft}s`}
          </p>
          {expired && (
            <button
              type="button"
              onClick={refreshQuote}
              className="text-sm mt-2 text-blue-500 hover:underline text-center w-full"
            >
              ↻ Refresh Price
            </button>
          )}
        </div>

        <form onSubmit={handleBuySubmit} className="flex flex-col gap-3">
          <p className="text-lg font-semibold">
            Price: {searchedCompany.primaryData.lastSalePrice}
          </p>
          <label htmlFor="amount" className="text-sm">
            Amount:
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            required
            className="mt-1 w-full p-2 rounded bg-gray-100 text-black"
          />
          <button
            type="submit"
            disabled={!canBuy}
            className={`mt-2 text-white ${
              canBuy
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-500 cursor-not-allowed'
            } focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5`}
          >
            {expired ? 'Quote Expired' : isBuying ? 'Processing...' : 'Buy'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuyModal;
