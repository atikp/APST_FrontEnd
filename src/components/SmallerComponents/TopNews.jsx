import { useState, useEffect } from "react";
import NewsCard from "./NewsCard";
import { useUser } from "../../context/UserContext"
import { API_BASE } from "../../utils/api";

const TopNews = () => {
  const [topNews, setTopNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const { currentUser } = useUser();


 

  useEffect(() => {
    // Get cached news from localStorage
    if(!currentUser) return;
    const cachedNews = localStorage.getItem("cachedNews");
    const cachedDate = Number(localStorage.getItem("cachedNewsTimestamp")) || 0;
    const parsedCachedDate = new Date(cachedDate).toLocaleDateString("en-GB");
    const today = new Date().toLocaleDateString("en-GB");
    const handleCachedData = () =>{
      try {
        // Parse the JSON
        const newsArray = JSON.parse(cachedNews);
  
        // Filter for "top news" category
        const filteredNews = newsArray.filter(item => item.category === "top news");
  
        // Set state with the first 10 top news items
        setTopNews(filteredNews.slice(0, 12));
        setLoading(false);
        
      } catch (error) {
        console.error("Error parsing cached news:", error);
        setError('Failed to fetch news. Please try again later.');
      }
    }

    const fetchCache = async () =>{
      setLoading(true);
    if(!cachedNews || parsedCachedDate !== today) {

        const response = await fetch(`${API_BASE}/api/finnhub/news?category=general&uid=${currentUser.uid}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const newsData = await response.json();

        // Cache the data
        localStorage.setItem('cachedNews', JSON.stringify(newsData));
        localStorage.setItem('cachedNewsTimestamp', Date.now().toString());


        setTopNews(newsData);
        handleCachedData()
        console.log('fetching fresh data');
    }
    else  {
      handleCachedData()
      // console.log('using cached data')
    } 
  }
  fetchCache();
  }, []);

  const handleMouseEnter = (id) => {
    setHoveredId(id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  if (loading) return <div className="text-center p-8">Loading news...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  return (
    <div className="mx-auto p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
      {topNews.map((item) => (
       <a 
       key={item.id}
       href={item.url}
       target="_blank"
       rel="noopener noreferrer"
       className="block h-full rounded-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-[1.02]  shadow-lg dark:shadow-blue-500/40 dark:inset-shadow-sm dark:inset-shadow-blue-50/10"
       onMouseEnter={() => handleMouseEnter(item.id)}
       onMouseLeave={handleMouseLeave}
     >
       <div className="relative h-full w-full">
         <div className={`h-full ${hoveredId === item.id ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
           <NewsCard card={item} />
         </div>
         <div className={`absolute inset-0 bg-gray-800 text-white p-4 flex flex-col rounded-lg transition-opacity duration-300 shadow-lg inset-shadow-sm inset-shadow-blue-500 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0'}`}
              >
           <p className="font-medium text-sm mb-2">{item.source}</p>
           <h3 className="font-semibold mb-2">{item.headline}</h3>
           <p className="text-sm flex-grow overflow-hidden">{item.summary}</p>
           <p className="text-xs text-gray-300 mt-2">Click to read more</p>
         </div>
       </div>
     </a>
      ))}
    </div>
  </div>
  );
};

export default TopNews;