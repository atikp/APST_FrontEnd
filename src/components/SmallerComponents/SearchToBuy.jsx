import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState, useCallback } from 'react';
import { debounce } from "lodash";

function SearchToBuy({setSearchedCompany}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // For keyboard navigation

  const companyData = JSON.parse(sessionStorage.getItem("companyFallback")) || {};

  // Combine all markets into a single array
  const allCompanies = [
    ...(companyData.nasdaq || []),
    ...(companyData.nyse || []),
    ...(companyData.amex || [])
  ];

  // Debounced search function
  const searchCompanies = useCallback(
    debounce((input) => {
      if (!input) {
        setSuggestions([]);
        return;
      }
      const filtered = allCompanies.filter((company) =>
        company.name?.toLowerCase().includes(input.toLowerCase()) || 
        company.symbol?.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered.length > 0 ? filtered : []);
    }, 300), // 300ms debounce
    [allCompanies]
  );

  // Handle input change
  const handleChange = (e) => {
    setQuery(e.target.value);
    searchCompanies(e.target.value);
  };

  // Handle submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query && suggestions.length > 0) {
      const selectedSymbol =
        selectedIndex !== -1
          ? suggestions[selectedIndex].symbol
          : suggestions[0].symbol;
      
      showBidBox(selectedSymbol);
    }
  };

  // Extracted navigation function to reuse
  const showBidBox = (symbol) => {
   
    setSearchedCompany(symbol)
    // Clear the search state
    setQuery("");
    setSuggestions([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="relative w-full max-w-sm h-20 min-w-[200px]">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type='text'
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent placeholder:text-slate-400 dark:text-white text-lg border border-slate-200 rounded-md pl-3 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow h-12 "
          placeholder="Company..." 
        />
        
        <button
          className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2 h-12"
          type="submit"
        >
          <MagnifyingGlassIcon aria-hidden="true" className="size-7" />
        </button> 
        {suggestions.length > 0 && (
          <ul className="absolute top-10 left-0 w-full mt-1 dark:bg-black bg-white outline-dotted outline-blue-500  overflow-clip rounded-2xl z-10 max-h-dvh">
            {suggestions.map((company, index) => (
              <li
                key={company.symbol}
                className={`p-2 cursor-pointer text-blue-500 ${
                  index === selectedIndex ? "bg-gray-600 text-blue-500" : ""
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseDown={() => showBidBox(company.symbol)}
                onTouchStart={()=> showBidBox(company.symbol)}
              >
                {company.name} ({company.symbol})
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  )
}

export default SearchToBuy;