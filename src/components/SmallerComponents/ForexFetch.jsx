import { useEffect } from "react";
import { API_BASE } from "../../utils/api";

function ForexFetch({ symbolFrom, symbolTo, setConversionRate, setCurrencyList }) {
  const url = `https://stocks.algobook.info/api/v1/exchange/`;

  useEffect(() => {
    const fetchForexData = async () => {
      try {
        const [rateResponse, currenciesResponse] = await Promise.all([
          fetch(`${API_BASE}/api/forex/rate?from=${symbolFrom}&to=${symbolTo}`),
          fetch(`${API_BASE}/api/forex/currencies`),
        ]);

        const rateResult = await rateResponse.json();
        const currencyListResult = await currenciesResponse.json();
        setConversionRate(rateResult.rate);
        setCurrencyList(currencyListResult);
      } catch (error) {
        console.error(error);
      }
    };

    fetchForexData();
  }, [symbolFrom, symbolTo]);
}

export default ForexFetch;