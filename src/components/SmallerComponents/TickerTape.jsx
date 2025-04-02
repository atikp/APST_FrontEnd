import { useEffect, useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { ArrowTrendingUpIcon,ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export default function StockTicker() {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const pausedRef = useRef(false);
  const [paused, setPausedState] = useState(false);
  const navigate = useNavigate();
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const setPaused = (val) => {
  pausedRef.current = val;
  setPausedState(val);
};

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const publicRef = doc(collection(db, 'public'), 'marketData');
        const snapshot = await getDoc(publicRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setGainers(data.gainers || []);
          setLosers(data.losers || []);
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
      }
    };

    fetchMarketData();
  }, []);

  const handleClick = (symbol) => {
    navigate(`/company/${symbol}`);
  };

  const renderTickerItem = (stock, type, key) => (
    <div
      key={key}
      className={`flex items-center gap-2 px-4 py-1 cursor-pointer whitespace-nowrap ${
        type === 'gainer' ? 'text-green-500' : 'text-red-500'
      }`}
      onClick={(e) => {
        e.stopPropagation(); // prevents pause toggle from firing
        handleClick(stock.symbol);
      }}
    >
      <span className="font-bold">{stock.symbol}</span>
      <span className="text-xs">{stock.name}</span>
      <span className="text-sm">
        {type === 'gainer' ? '+' : '-'}
        {Number(stock.changesPercentage).toFixed(2)}%
      </span>
    </div>
  );

  return (
    
    <div
      className="w-full dark:bg-black bg-white text-white overflow-hidden sticky top-0 md:pt-29 z-40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => isTouchDevice && setPaused(prev => !prev)}
    >
      <div className="flex items-center px-4 py-2 text-sm font-medium">
        <span className="mr-4 dark:text-yellow-300 text-yellow-800"><ArrowTrendingUpIcon className='h-6 w-8'/> Gainers</span>
        <div className=" relative overflow-hidden w-full">
          <div
            className={`flex flex-nowrap w-max gap-6 animate-marquee ${paused ? 'pause' : ''}`}
          >
             {gainers.map((stock, idx) =>
      renderTickerItem(stock, 'gainer', idx)
    )}
          </div>
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r dark:from-black dark:via-black/80 to-transparent pointer-events-none z-10 from-white via-white/80  " />
  <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l  dark:from-black dark:via-black/80 to-transparent pointer-events-none z-10 from-white via-white/80 " />
        </div>
      </div>
      <div className="flex items-center px-4 py-2 text-sm font-medium">
        <span className="mr-4 dark:text-yellow-300 text-yellow-600"><ArrowTrendingDownIcon className='h-6 w-8'/> Losers</span>
        <div className=" relative overflow-hidden w-full">
          <div
            className={`flex flex-nowrap w-max  gap-6 animate-marquee ${paused ? 'pause' : ''}`}
          >
            {losers.map((stock, idx) =>
      renderTickerItem(stock, 'loser', idx)
    )}
          </div>
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r  dark:from-black dark:via-black/80 to-transparent pointer-events-none z-10 from-white via-white/80 " />
  <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l  dark:from-black dark:via-black/80 to-transparent pointer-events-none z-10 from-white via-white/80 " />
        </div>
      </div>
    </div>
  );
}