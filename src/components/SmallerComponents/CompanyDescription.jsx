import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StockGraph from '../ChartComponents/MainStock';
import useAccolade from '../../hooks/UseAccolades';
import { useNavigate } from 'react-router-dom';

const makeThousand = (x, y, z) =>
  Number(x).toLocaleString('en-US', { style: y, currency: z });

function CompanyDescription() {
  const [fetchedData, setFetchedData] = useState({});
  const [logoUrl, setLogoUrl] = useState(null);
  const [companyFallback, setCompanyFallback] = useState({});
  const [currentData, setCurrentData] = useState({});
  const { symbol } = useParams();
  const navigate = useNavigate();
  const {currentUser} = useUser();
  const sessionStuff = JSON.parse(
    sessionStorage.getItem('companyFallback')
  ) || {
    nasdaq: [],
    nyse: [],
    amex: [],
  };
  const { checkAndAddAccolade } = useAccolade();

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

  useEffect(() => {
    if (currentUser?.uid) {
      checkAndAddAccolade('visitedCompany');
    }
  }, [currentUser]);



  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !symbol) return;
  
      try {
        // Fetch current stock data
        const currentResponse = await fetch(`/api/nasdaq/quote/${symbol}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            Accept: 'application/json',
          },
        });
  
        if (!currentResponse.ok) {
          if (currentResponse.status === 400) {
            toast.error("Please add your API key in your profile.");
          } else {
            toast.error("Failed to fetch company data.");
          }
          throw new Error(`HTTP error! Status: ${currentResponse.status}`);
        }
  
        const currentDataJson = await currentResponse.json();
        if (currentDataJson?.data) {

          setCurrentData(currentDataJson.data);
        } else {
          console.error('No current data found for symbol:', symbol);
        }
  
        // Check sessionStorage first for company data
        const SessionFetchedDataSave = sessionStorage.getItem("alreadyFetchedCompanyData");

        let parsedData = SessionFetchedDataSave ? JSON.parse(SessionFetchedDataSave) : [];
  
        let companyData = parsedData.find((obj) => obj.symbol === symbol);
  
        // Fetch fresh if not in session
        if (!companyData) {
          const freshCompanyDataResponse = await fetch(`/api/fmp/profile/${symbol}?uid=${currentUser.uid}`);
          if (!freshCompanyDataResponse.ok) {
            throw new Error(`HTTP error! Status: ${freshCompanyDataResponse.status}`);
          }
  
          const freshCompanyDataJson = await freshCompanyDataResponse.json();
          if (freshCompanyDataJson.length > 0) {
            companyData = freshCompanyDataJson[0];
            parsedData.push(companyData);
            sessionStorage.setItem("alreadyFetchedCompanyData", JSON.stringify(parsedData));
          }
        }
  
        if (companyData?.symbol) {
          setFetchedData(companyData);
          setLogoUrl(
            `https://raw.githubusercontent.com/atikp/stockFetcher/refs/heads/main/icons/stock_icons/${symbol}.png`
          );
        } else {
          console.error('No company data found for symbol:', symbol);
        }
  
        // Fallback from company lists in sessionStorage
        const allExchanges = ['nasdaq', 'nyse', 'amex'];
        let fallbackData = null;
        for (const exchange of allExchanges) {
          fallbackData = sessionStuff[exchange]?.find((el) => el.symbol === symbol);
          if (fallbackData) break;
        }
  
        setCompanyFallback(fallbackData || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional smooth scroll
  
  }, [symbol, currentUser]); // Only re-run when `symbol` changes

  return (
    <div className="">
      <p className="font-bold text-2xl pb-2 flex place-self-center dark:text-white">
        {fetchedData.companyName} ( {fetchedData.country} )
      </p>
      <StockGraph symbol={fetchedData.symbol} website={companyFallback.url}/>
      <div className="company-data mt-5 mx-5 border-0 flex-col rounded-2xl p-10 text:black dark:text-white dark:bg-gray-900">
        <div className="company-header flex max-md:flex-col justify-between border-gray-200 dark:bg-gray-800 rounded-3xl p-5 bg-gray-200">
          <div className="imgBlock flex flex-col justify-center sm:mr-10">
          <img
            src={logoUrl}
            alt="company logo"
            className="h-[200px] flex max-md:w-[200px] max-md:place-self-center"
          />
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
          <div className="basic-info flex max-md:flex-col justify-between place-self-center">
            <div className="name-symbol flex-col py-5">
              <p>Symbol: {fetchedData.symbol || 'Loading...'}</p>
              <p className="font-bold flex text-2xl pb-2 place-self-start">
                {fetchedData.companyName
                  ? `${fetchedData.companyName} (${fetchedData.country})`
                  : 'Loading...'} 
              </p>
              <a className="text-blue-500" href={fetchedData.website || '#'}>
                {fetchedData.website || 'Loading...'}
              </a>
              <p>
                Sector: {fetchedData.sector || 'Loading...'} </p>
                <p>Industry: {fetchedData.industry || 'Loading...'}
              </p>
              <p>Exchange: {currentData?.exchange}</p>
              <p className={`${currentData?.marketStatus === 'Open' ? 'text-green-400' : 'text-red-600'}`}>
  Market Status: {currentData?.marketStatus || 'Unknown'}
</p> 
            </div>
            <div className="fiscal-info flex-col px-5 justify-self-start">
              <h3 className="text-xl font-bold"> Financial Info</h3>
                <p>
                  Market Capitalization:{' '}
                  {fetchedData.marketCap
                    ? makeThousand(
                        fetchedData.marketCap,
                        'currency',
                        'USD'
                      )
                    : 'Loading...'}
                </p>  
                <p>
                  52 Weeks range:{' '}
                  ${currentData?.keyStats?.fiftyTwoWeekHighLow?.value || 'Loading...'}
                </p>
                <p>
                  Day Range: ${currentData?.keyStats?.dayrange?.value || 'Loading...'}
                </p>
                <p className="text-xl text-red-500">
                Last Close: {companyFallback?.lastsale || 'Loading...'}
              </p>
              <p className='text-xl'>last Sale: {currentData?.primaryData?.lastSalePrice} at <br/> {currentData?.primaryData?.lastTradeTimestamp}</p>
              <p className={`${currentData?.primaryData?.deltaIndicator === 'up' ? 'text-green-400' : 'text-red-600'}`}>{(currentData?.primaryData?.deltaIndicator)?.toUpperCase()} from previous Sale</p>
                
                <a
                  className="border-solid border-amber-50 text-blue-500"
                  target="_blank"
                  href={`https://www.nasdaq.com${companyFallback.url}`}
                >
                  {' '}
                 
                  More Info...{' '}
                </a>
            </div>
          </div>
        </div>
        <div className="company-body mt-5 pb-25">
          <h1 className="text-2xl font-bold py-2">Company Description</h1>
          <p>{fetchedData.description}</p>
        </div>
      </div>
    </div>
  );
}

export default CompanyDescription;