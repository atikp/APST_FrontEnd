import { useState, useEffect } from 'react';
import NewsCard from './SmallerComponents/NewsCard';
import { useUser } from '../context/UserContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { toast } from 'react-toastify';


function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const { currentUser,userData,setUserData } = useUser();

  useEffect(() => {
    const fetchNews = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // Check if we have cached news from today
        const cachedNews = localStorage.getItem('cachedNews');
        const cachedTimestamp = localStorage.getItem('cachedNewsTimestamp');
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).getTime();

        // Use cached data if it exists and is from today
        if (
          cachedNews &&
          cachedTimestamp &&
          parseInt(cachedTimestamp) >= today
        ) {
          setNews(JSON.parse(cachedNews));
          setLoading(false);
          return;
        }

        // Otherwise fetch fresh data from Finnhub
        console.log('Fetching fresh news data');

        if(!currentUser) return;
        const response = await fetch(
          `/api/finnhub/news?category=general&uid=${currentUser.uid}`
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const newsData = await response.json();
        setNews(newsData);

        // Cache the data
        localStorage.setItem('cachedNews', JSON.stringify(newsData));
        localStorage.setItem('cachedNewsTimestamp', Date.now().toString());
      } catch (err) {
        setError('Failed to fetch news. Please try again later.');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
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
    <main>
      <div className="bg-white dark:bg-black md:pb-30">
        <div className="relative isolate px-2 pt-14 lg:px-8">
          <h1 className="mb-10 flex self-center place-self-center z-50 text-6xl dark:text-white">
            News
          </h1>
          <div className="newsCards flex flex-wrap gap-20 justify-evenly items-center">
            <div className="max-w-8xl mx-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ">
                {news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-80 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl inset-shadow-sm inset-shadow-blue-500"
                    onClick={async () => {
                      if (userData && !userData.FirstTime?.includes("firstNews")) {
                        try {
                          const userRef = doc(db, "users", userData.uid);
                          await updateDoc(userRef, {
                            FirstTime: arrayUnion("firstNews"),
                          });
                  
                          setUserData((prev) => ({
                            ...prev,
                            FirstTime: [...(prev.FirstTime || []), "firstNews"],
                          }));
                  
                          toast.success("📰 Achievement Unlocked: First News Article Opened!");
                        } catch (err) {
                          console.error("Error updating accolades:", err);
                        }
                      }
                    }}
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
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl md:top-[calc(100%-50rem)] max-lg:top-[calc(100%-80rem)]"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default News;
