import { useState, useEffect } from 'react';
import BuyModal from './BuyModal';
import { API_BASE } from "../../utils/api";

const SearchToBuyResult = ({ searchedSymbol, setShowCompanyCard,scrollToHoldings  }) => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/nasdaq/quote/${searchedSymbol}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            Accept: 'application/json',
          },
        });

        const data = await res.json();
        setCompanyData(data.data);
        setLogoUrl(
          `https://raw.githubusercontent.com/atikp/stockFetcher/refs/heads/main/icons/stock_icons/${searchedSymbol}.png`
        );
      } catch (err) {
        console.error('Failed to fetch company:', err);
      } finally {
        setLoading(false);
      }
    };

    if (searchedSymbol) fetchCompany();
  }, [searchedSymbol]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (!companyData) return <p className="text-white">No company data found.</p>;

  return (
    <div className="p-5">
      <div className="max-w-md bg-gray-200 dark:bg-gray-800 rounded-lg p-4 text-center">
        <img
          src={logoUrl}
          alt={`${searchedSymbol} logo`}
          className="mx-auto w-16 h-16 mb-3"
        />

        <h2 className="text-lg font-semibold text-black dark:text-white">
          {companyData.companyName}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Symbol: {searchedSymbol} <br />
          Price: {companyData?.primaryData?.lastSalePrice || 'N/A'}
        </p>

        <button
          onClick={() => setShowBuyModal(true)}
          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded px-4 py-2"
        >
          Buy
        </button>
      </div>

      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <BuyModal
          symbol={searchedSymbol}
          scrollToHoldings={scrollToHoldings}
          onClose={() => {
            setShowBuyModal(false);
            setShowCompanyCard(false); 
          }}
        />
      </div>
      )}
    </div>
  );
};

export default SearchToBuyResult;
