import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import TwentyFourHourChart from './twofourChart';
import OneMonthChart from './monthlyStock';
import OneYearChart from './OneYearChart';
import TwentyYearChart from './Twenty';
import { API_BASE } from "../../utils/api";
import { toast } from 'react-toastify';

const CHART_TYPES = {
  '24h': { component: TwentyFourHourChart, dataType: 'intraday' },
  '1m': { component: OneMonthChart, dataType: 'intraday' },
  '1y': { component: OneYearChart, dataType: 'monthly' },
  '20y': { component: TwentyYearChart, dataType: 'monthly' }
};

const StockGraph = ({ symbol, website }) => {
  const { currentUser } = useUser();
  const [chartData, setChartData] = useState({
    intraday: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('24h');
  const [limitReached, setLimitReached] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Initialize from window or default to 'light'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const fetchStatus = useRef({
    inProgress: false,
    fetchedIntraday: false,
    fetchedMonthly: false
  });
  
  // const useMock = import.meta?.env?.VITE_USE_MOCK === 'true';
  const useMock = false

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // console.log(theme)
    // Initial check
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Set up listener for changes using the modern addEventListener
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    // Modern approach with try/catch for better browser compatibility
    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.warn('Browser doesn\'t support matchMedia addEventListener, theme updates may not be detected');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Skip if no user, limit reached, or fetch already in progress
      if (!currentUser || limitReached || fetchStatus.current.inProgress) return;
      
      const { dataType } = CHART_TYPES[activeChart];
      
      // Skip if we've already fetched this data type
      if (fetchStatus.current[`fetched${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`]) {
        setLoading(false);
        return;
      }
      
      fetchStatus.current.inProgress = true;
      setLoading(true);
      
      const cacheKey = `${symbol}_${dataType}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        setChartData(prev => ({ ...prev, [dataType]: JSON.parse(cached) }));
        fetchStatus.current[`fetched${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`] = true;
        setLoading(false);
        fetchStatus.current.inProgress = false;
        return;
      }

      try {
        if (useMock) {
          await fetchMockData(dataType);
        } else {
          await fetchRealData(dataType);
        }
      } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
        toast.error(`Failed to load chart data: ${error.message}`);
        setLimitReached(true);
      } finally {
        setLoading(false);
        fetchStatus.current.inProgress = false;
      }
    };

    fetchData();
  }, [symbol, activeChart, currentUser,theme]);

  const fetchMockData = async (dataType) => {
    try {
      const mockPath = dataType === 'intraday' 
        ? '../../mock/mockStockData.json'
        : '../../mock/mockStockDataYear.json';
      
      const mockModule = await import(mockPath);
      const timeSeries = dataType === 'intraday' 
        ? mockModule.default["Time Series (5min)"]
        : mockModule.default["Monthly Time Series"];
      
      const formatted = Object.entries(timeSeries)
        .map(([date, values]) => ({
          date,
          open: parseFloat(values["1. open"]),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setChartData(prev => ({ ...prev, [dataType]: formatted }));
      sessionStorage.setItem(`${symbol}_${dataType}`, JSON.stringify(formatted));
      fetchStatus.current[`fetched${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`] = true;
    } catch (error) {
      console.error('Error fetching mock data:', error);
      throw new Error('Could not load mock data');
    }
  };

  const fetchRealData = async (dataType) => {
    const endpoint = `${API_BASE}/api/alpha/${dataType}/${symbol}?uid=${currentUser.uid}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    
    // Check for API errors
    if (res.status !== 200 || 
        data['Error Message'] || 
        (data.Information && data.Information.includes("standard API rate limit"))) {
      setLimitReached(true);
      toast.error("API limit reached for today. Try again tomorrow.");
      return;
    }
    
    const timeSeriesKey = dataType === 'intraday' ? 'Time Series (5min)' : 'Monthly Time Series';
    if (!data[timeSeriesKey]) {
      toast.error("Chart data unavailable. Try again later.");
      return;
    }
    
    const formatted = Object.entries(data[timeSeriesKey])
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setChartData(prev => ({ ...prev, [dataType]: formatted }));
    sessionStorage.setItem(`${symbol}_${dataType}`, JSON.stringify(formatted));
    fetchStatus.current[`fetched${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`] = true;
  };

  if (limitReached) {
    return (
      <div className="p-4 mt-5 mx-5 border rounded-2xl dark:bg-gray-900 text-center">
        <p className="text-red-500 font-semibold">
          You have reached your API limit for today.
        </p>
        <p className="text-gray-400">
          Charts are limited to 25 companies per day. For more details, visit
          the official company profile:
          <a
            href={`https://www.nasdaq.com${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 ml-1"
          >
            {`https://www.nasdaq.com${website}`}
          </a>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div role="status" className="flex justify-center items-center h-64">
        <svg
          className="w-8 h-8 animate-spin text-gray-200 dark:text-gray-300 fill-blue-400"
          viewBox="0 0 100 101"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.59c0 27.61-22.39 50-50 50S0 78.2 0 50.59 22.39.59 50 .59c27.61 0 50 22.39 50 50Z"
            fill="currentColor"
          />
          <path
            d="M93.97 39.04a5 5 0 0 0 3.04-6.49A49.97 49.97 0 0 0 25.84 3.65a5 5 0 1 0 1.2 9.96A40.04 40.04 0 0 1 91.51 38.1a5 5 0 0 0 2.46.94Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  const { dataType } = CHART_TYPES[activeChart];
  const currentChartData = chartData[dataType];
  const ChartComponent = CHART_TYPES[activeChart].component;

  // Get the most recent date from the chart data
  const lastDate = currentChartData[currentChartData.length - 1]?.date || '';
  const formattedDate = lastDate
    ? new Date(lastDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="p-4 mt-5 mx-5 border rounded-2xl dark:bg-gray-900">
      <div className="flex justify-center space-x-4 mb-4">
        {Object.keys(CHART_TYPES).map((timeframe) => (
          <button
            key={timeframe}
            className={`px-4 py-2 rounded-lg ${
              activeChart === timeframe
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
            onClick={() => setActiveChart(timeframe)}
          >
            {timeframe.toUpperCase()}
          </button>
        ))}
      </div>

      <ChartComponent
        data={currentChartData}
        symbol={symbol}
        theme={theme}
        date={formattedDate}
      />
    </div>
  );
};

export default StockGraph;