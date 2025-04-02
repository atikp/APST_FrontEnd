import {
  ArrowTrendingUpIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function StockCard({ symbol, price }) {
  const [companyName, setCompanyName] = useState("Loading...");
  const [companyData, setCompanyData] = useState({});
  const [lastClose, setLastClose] = useState(null);
  const [trend, setTrend] = useState(null);
  const navigate = useNavigate();
  const cardRef = useRef(null);
  useEffect(() => {
    const fallback = JSON.parse(sessionStorage.getItem("companyFallback"));
    if (!fallback) return;

    const combined = [
      ...(fallback.nasdaq || []),
      ...(fallback.nyse || []),
      ...(fallback.amex || []),
    ];

    const found = combined.find((company) => company.symbol === symbol);

    if (found) {
      setCompanyName(
        found?.description || found?.name || found?.companyName || symbol
      );
      setCompanyData(found);
    } else {
      setCompanyName("Unknown");
      setCompanyData({});
    }
  }, [symbol]);

  useEffect(() => {
    if (companyData?.lastsale) {
      const numeric = parseFloat(companyData.lastsale.replace("$", ""));
      setLastClose(numeric);
    }
  }, [companyData]);

  useEffect(() => {
    if (price && lastClose !== null) {
      setTrend(price > lastClose ? "up" : "down");
    }
  }, [price, lastClose]);

  const handleTrade = () => {
    navigate("/transactions", {
      state: { symbol },
    });
  };

  const handleEditWatchlist = () => {
    navigate("/profile", {
      state: { scrollTo: "watchlist" },
    });
  };

  const handleCardClick = (e) => {
    if( e.target.closest("button") || e.target.tagName === "BUTTON" || e.target.tagName === "A"){
      return
    }
    navigate(`/company/${symbol}`); 
  }

  return (
    <div className="max-w-sm flex flex-col max-md:flex-row max-md:h-80 items-center rounded overflow-hidden shadow-lg dark:shadow-blue-500/40" ref={cardRef} onClick={handleCardClick}>
      <div className="px-5 py-4 w-60 h-60 flex-col justify-center items-center mb-5">
        <ArrowTrendingUpIcon className="h-6 max-md:h-4 mx-auto dark:text-white" />
        <div className="font-bold text-xl text-center dark:text-white mt-2">
          <h1 className="">{companyName}</h1>
          <div className="text-gray-500 mt-2">
            <h2 className={`text-lg ${trend === "up" ? (
                  ` text-green-500`
                ) : (
                  ` text-red-500`
                )}`}>
              {price
                ? `$${price.toFixed(2)}`
                : `Last Close: ${companyData.lastsale || "N/A"}`}
            </h2>
            {lastClose !== null && (
              <div className="flex justify-center mt-1 mb-2">
                {trend === "up" ? (
                  <ChevronDoubleUpIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <ChevronDoubleDownIcon className="h-6 w-6 text-red-500" />
                )}
              </div>
            )}
            <p className="text-sm">
              {price ? `Last Close: ${companyData.lastsale}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 px-6 pt-4 pb-6 my-3">
        <button
          onClick={handleTrade}
          className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700 font-medium rounded-lg text-sm px-5 py-2.5 shadow-lg"
        >
          Trade This Stock
        </button>
        <button
          onClick={handleEditWatchlist}
          className="text-white bg-gradient-to-r from-blue-400 via-blue-500 to-violet-600 hover:from-blue-500 hover:to-violet-700 font-medium rounded-lg text-sm px-5 py-2.5 shadow-lg"
        >
          Edit Watchlist
        </button>
      </div>
    </div>
  );
}

export default StockCard;