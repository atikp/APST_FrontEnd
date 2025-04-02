import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import TwentyFourHourChart from './twofourChart';
import OneMonthChart from './monthlyStock';
import OneYearChart from './OneYearChart';
import TwentyYearChart from './Twenty';

const StockGraph = ({ symbol, theme, website }) => {
  const { currentUser } = useUser();
  const [intradayData, setIntradayData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('24h');
  const [limitReached, setLimitReached] = useState(false);

  const fetchedIntraday = useRef(false);
  const fetchedMonthly = useRef(false);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setLimitReached(false);
    fetchedIntraday.current = false;
    fetchedMonthly.current = false;

    const fetchDataBasedOnActiveChart = async () => {
      if (limitReached || !currentUser) return;

      const cacheKey = `${symbol}_${activeChart}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        if (activeChart === '24h' || activeChart === '1m') {
          setIntradayData(parsed);
        } else {
          setMonthlyData(parsed);
        }
        setLoading(false);
        return;
      }

      try {
        let endpoint = '';

        if (
          (activeChart === '24h' || activeChart === '1m') &&
          !fetchedIntraday.current
        ) {
          endpoint = `/api/alpha/intraday/${symbol}?uid=${currentUser.uid}`;
          fetchedIntraday.current = true;
        } else if (
          (activeChart === '1y' || activeChart === '20y') &&
          !fetchedMonthly.current
        ) {
          endpoint = `/api/alpha/monthly/${symbol}?uid=${currentUser.uid}`;
          fetchedMonthly.current = true;
        } else {
          return;
        }

        const res = await fetch(endpoint);
        const data = await res.json();

        if (res.status !== 200 || data.note || data['Error Message']) {
          setLimitReached(true);
          return;
        }

        let formatted = [];

        if (data['Time Series (5min)']) {
          formatted = Object.entries(data['Time Series (5min)'])
            .map(([date, values]) => ({
              date,
              open: parseFloat(values['1. open']),
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          setIntradayData(formatted);
        } else if (data['Monthly Time Series']) {
          formatted = Object.entries(data['Monthly Time Series'])
            .map(([date, values]) => ({
              date,
              open: parseFloat(values['1. open']),
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          setMonthlyData(formatted);
        }

        // Only store transformed chart data
        sessionStorage.setItem(cacheKey, JSON.stringify(formatted));
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLimitReached(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDataBasedOnActiveChart();
  }, [symbol,theme, activeChart, currentUser, limitReached]);

  const chartComponents = {
    '24h': TwentyFourHourChart,
    '1m': OneMonthChart,
    '1y': OneYearChart,
    '20y': TwentyYearChart,
  };

  const ChartComponent = chartComponents[activeChart];

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
            className="text-blue-500 ml-1"
          >
            {`https://www.nasdaq.com${website}`}
          </a>
        </p>
      </div>
    );
  }
  const chartData = activeChart === '24h' || activeChart === '1m'
  ? intradayData
  : monthlyData;

// Get the most recent date from the chart data
const lastDate = chartData?.[chartData.length - 1]?.date || '';

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
        {Object.keys(chartComponents).map((timeframe) => (
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
        data={
          activeChart === '24h' || activeChart === '1m'
            ? intradayData
            : monthlyData
        }
        symbol={symbol}
        theme={theme}
        date={formattedDate}
      />
    </div>
  );
};

export default StockGraph;
