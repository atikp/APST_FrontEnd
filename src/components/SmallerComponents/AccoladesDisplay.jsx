import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import firstCompanyVisitImage from '../../assets/badges/firstCompanyVisit.png'
import firstBuyImage from '../../assets/badges/firstBuy.png'
import firstSellImage from '../../assets/badges/firstSell.png'
import firstHundredImage from '../../assets/badges/firstHundred.png'
import firstThousandImage from '../../assets/badges/firstThousand.png'
import firstFiveThousandImage from '../../assets/badges/firstFiveThousand.png'
import firstTenThousandImage from '../../assets/badges/firstTenThousand.png'
import firstNewsImage from '../../assets/badges/firstNews.png'
import firstWatchlistAddImage from '../../assets/badges/firstWatchlistAdd.png'
import faqViewImage from '../../assets/badges/faqView.png'
import MobileFriendlyTooltip from './MobileFriendlyTooltip';


const ACCOLADES = {
  visitedCompany: { label: "First Company Viewed", image: firstCompanyVisitImage },
  firstBuy: { label: "First Stock Purchase", image: firstBuyImage },
  firstSell: { label: "First Stock Sale", image: firstSellImage },
  firstHundred: { label: "Earned $100", image: firstHundredImage },
  firstThousand: { label: "Earned $1,000", image: firstThousandImage },
  firstFiveThousand: { label: "Earned $5,000", image: firstFiveThousandImage },
  firstTenThousand: { label: "Earned $10,000", image: firstTenThousandImage },
  firstNews: { label: "Read First News", image: firstNewsImage },
  firstWatchlistAdd: { label: "Added to Watchlist", image: firstWatchlistAddImage },
  faqViewed: { label: "FAQ Nerd Badge", image: faqViewImage },
};

export default function AccoladesDisplay({ accolades = [],userData }) {
  return (
    <div className="mt-10 p-6 rounded-xl border dark:border-gray-700 border-gray-300 bg-white dark:bg-black shadow-md">
      <MobileFriendlyTooltip title={"Accomplishments"} message={"If your Accolades aren't loading, try refreshing the page."} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Object.entries(ACCOLADES).map(([key, { label, image }]) => {
          const unlocked = accolades.includes(key);
          return (
            <div
              key={key}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all text-center border shadow-md ${
                unlocked
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400"
              }`}
            >
               <img src={image} alt={label} className={`w-15 h-15 p-2 border-black-2px-solid rounded-2xl bg-white ${unlocked ? 'opacity-100' : 'opacity-50'}`} />
              <div className="mt-2 text-sm font-medium">{label}</div>
              {!unlocked && <p className="text-xs mt-1 italic">(Locked)</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm dark:bg-gray-900">
  <h2 className="text-lg font-semibold text-yellow-400 mb-2">🔥 Login Streak</h2>
  <p className="text-white">
    You're on a <span className="font-bold text-orange-500">{userData?.loginStreak || 0}-day</span> login streak!
  </p>
  <p className="text-sm text-gray-400 mt-1">
    Keep logging in daily to earn:
  </p>
  <ul className="text-sm text-white list-disc ml-5">
    <li>$10 per day</li>
    <li>$100 for a 7-day streak</li>
    <li>$1,000 for a 30-day streak</li>
  </ul>
  <p className="text-xs text-gray-500 mt-2">
    Streak resets if you miss a day.
  </p>
</div>
    </div>
  );
}