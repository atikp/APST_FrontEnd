import { useState, useEffect } from "react";
import SellModal from "./SellModal";
import { useUser } from "../../context/UserContext";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/solid";

const HoldingsCard = ({ holding }) => {
  const [logoUrl, setLogoUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { setUserData } = useUser();

  const {
    symbol,
    stockName,
    pricePurchasedAt,
    amountOfStock,
    totalPriceAtPurchase,
    date,
  } = holding;

  const [currentPrice, setCurrentPrice] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);

  useEffect(() => {
    setLogoUrl(
      `https://raw.githubusercontent.com/atikp/stockFetcher/refs/heads/main/icons/stock_icons/${symbol}.png`
    );

    const fetchLivePrice = async () => {
      try {
        const res = await fetch(`/api/nasdaq/quote/${symbol}`);
        const data = await res.json();
        const livePrice = parseFloat(
          data?.data?.primaryData?.lastSalePrice?.replace("$", "") || "0"
        );
        setCurrentPrice(livePrice);

        const currentValue = livePrice * amountOfStock;
        const difference = currentValue - totalPriceAtPurchase;
        const percentage = ((difference / totalPriceAtPurchase) * 100).toFixed(2);

        setProfitLoss({ difference, percentage });
      } catch (err) {
        console.error("Failed to fetch live price:", err);
      }
    };

    fetchLivePrice();
  }, [symbol, amountOfStock, totalPriceAtPurchase]);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleSell = ({ newBalance, holdings, transactions }) => {
    setUserData((prev) => ({
      ...prev,
      balance: newBalance,
      holdings,
      transactions,
    }));
    setShowModal(false);
  };

  const profitLossColor =
    profitLoss?.difference > 0 ? "text-green-500" : "text-red-500";

  return (
    <>
      <div className="max-w-sm w-70 bg-gray-200 dark:bg-gray-900 dark:text-white rounded-xl shadow-lg inset-shadow-sm inset-shadow-blue-500 overflow-hidden flex">
        <div className="relative h-60 flex-col place-items-center justify-center p-5">
          <img
            src={logoUrl}
            alt={`${symbol} logo`}
            className="w-20 object-cover m-5"
          />
          <button
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg font-medium rounded-lg text-sm px-5 py-2.5"
            onClick={() => setShowModal(true)}
          >
            Sell
          </button>
        </div>

        <div className="flex-col flex p-5 justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {stockName}
            </h3>
            <p className="text-gray-500 mt-1">{symbol}</p>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ${pricePurchasedAt.toFixed(2)}
            </p>
            <p>Shares: {amountOfStock}</p>
            <p>Paid: ${totalPriceAtPurchase.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Purchased: {formattedDate}</p>

            {profitLoss && (
              <p className={`mt-2 font-semibold flex items-center gap-1 ${profitLossColor}`}>
                {profitLoss.difference > 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5" />
                )}
                {profitLoss.difference >= 0 ? "+" : ""}
                {profitLoss.difference.toFixed(2)} ({profitLoss.percentage}%)
              </p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <SellModal
            holding={holding}
            onSell={handleSell}
            onClose={() => setShowModal(false)}
          />
        </div>
      )}
    </>
  );
};

export default HoldingsCard;