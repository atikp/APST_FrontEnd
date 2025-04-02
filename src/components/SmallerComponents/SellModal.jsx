import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { API_BASE } from "../../utils/api";

const SellModal = ({ holding, onSell, onClose }) => {
  const { userData } = useUser();
  const { symbol, stockName, pricePurchasedAt, amountOfStock } = holding;

  const [amountToSell, setAmountToSell] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setLogoUrl(
      `https://raw.githubusercontent.com/atikp/stockFetcher/refs/heads/main/icons/stock_icons/${symbol}.png`
    );

    const fetchLivePrice = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/nasdaq/quote/${symbol}`);
        const data = await response.json();
        const price = parseFloat(
          data?.data?.primaryData?.lastSalePrice?.replace("$", "") || "0"
        );
        setCurrentPrice(price);
      } catch (err) {
        console.error("Error fetching live price:", err);
        setCurrentPrice(pricePurchasedAt);
      } finally {
        setLoading(false);
      }
    };

    fetchLivePrice();
  }, [symbol]);

  // Timer countdown
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

  const handleSell = async () => {
    if (!userData?.uid || expired) return;

    const totalSellAmount = Number(amountToSell) * currentPrice;

    try {
      const response = await fetch(`${API_BASE}/api/trade/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userData.uid,
          symbol,
          stockName,
          priceSoldAt: currentPrice,
          amountToSell,
          totalSellAmount,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sell failed");

      if (onSell) {
        const { newBalance, holdings, transactions } = result;
        if (!userData?.FirstTime?.includes("firstSell")) {
          try {
            const userRef = doc(db, 'users', userData.uid);
            await updateDoc(userRef, {
              FirstTime: arrayUnion("firstSell"),
            });
        
            setUserData((prev) => ({
              ...prev,
              FirstTime: [...(prev.FirstTime || []), "firstSell"],
            }));
        
            toast.success("🏅 Achievement Unlocked: First Stock Sale!");
          } catch (err) {
            console.error("Error updating accolades:", err);
          }
        }
        onSell({ newBalance, holdings, transactions });
      }

      if (onClose) onClose();
    } catch (error) {
      console.error("Sell request failed:", error.message);
    }
  };

  const canSell =
    !expired &&
    Number(amountToSell) > 0 &&
    Number(amountToSell) <= amountOfStock &&
    !loading &&
    currentPrice > 0;

  const progressWidth = `${(timeLeft / 10) * 100}%`;

  return (
    <div className="max-w-md bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg relative">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Sell {stockName} ({symbol})
        </h2>
        <button onClick={onClose} className="text-red-500 font-bold text-lg">✕</button>
      </div>

      <div className="mb-4">
        <div className="relative w-full bg-gray-300 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
          <div
            className={`bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out`}
            style={{ width: progressWidth }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
          {expired
            ? "Price quote expired. Please reopen to refresh."
            : `Live quote expires in ${timeLeft}s`}
        </p>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={logoUrl || undefined}
          alt="logo"
          className="w-16 h-16 object-contain"
        />
        <div>
          <p className="text-gray-700 dark:text-gray-200">
            Shares Held: <strong>{amountOfStock}</strong>
          </p>
          <p className="text-gray-700 dark:text-gray-200">
            Live Price:{" "}
            {loading ? "Loading..." : `$${currentPrice.toFixed(2)}`}
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSell();
        }}
        className="mt-4"
      >
        <label className="block mb-2 text-sm text-gray-700 dark:text-white">
          Amount to sell:
        </label>
        <input
          type="number"
          min="1"
          max={amountOfStock}
          value={amountToSell}
          onChange={(e) => setAmountToSell(e.target.value)}
          className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          You'll receive:{" "}
          {isNaN(amountToSell * currentPrice)
            ? "$0"
            : (amountToSell * currentPrice).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
        </p>
        <button
          type="submit"
          disabled={!canSell}
          className={`mt-4 w-full px-4 py-2 rounded-lg text-white font-bold ${
            canSell
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {expired ? "Quote Expired" : "Confirm Sell"}
        </button>
      </form>
    </div>
  );
};

export default SellModal;