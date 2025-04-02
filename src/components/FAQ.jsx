import { useState,useEffect  } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext"; 
import { db } from "../../firebase"; 

  const faqs = [
    {
      question: 'What is AP Stock Trader?',
      answer:
        `AP Stock Trader is a simulated trading app where you can practice buying and selling real-time stock data using fake money. It's designed to help you learn the stock market without any financial risk.`,
    },
    {
      question: 'Do I need my own API keys?',
      answer:
        `Yes. You'll need to sign up for your own free API keys from providers like Alpha Vantage, Financial Modeling Prep, and Finnhub to access real-time stock data. You can add and manage your keys in your profile settings.`,
    },
    {
      question: 'Why do I need my own API keys?',
      answer:
        `To ensure fair usage and avoid rate limiting across users, each trader is responsible for their own API key usage. It also protects the app from misuse and allows you to use your quota as you wish.`,
    },
    {
      question: 'How much fake money do I get to start with?',
      answer:
        `Each new user starts with $10,000 in virtual funds that you can use to trade stocks in the simulated market.`,
    },
    {
      question: 'How are transactions handled?',
      answer:
        `When you buy or sell a stock, your transaction is logged in your personal transaction history. Holdings update in real-time, and profits/losses are calculated based on live price data.`,
    },
    {
      question: 'Where does the live stock data come from?',
      answer:
        `Live stock data is pulled from trusted third-party APIs like Alpha Vantage, Finnhub, and Financial Modeling Prep using the API keys you provide.`,
    },
    {
      question: 'Is this a real trading platform?',
      answer:
        `No. This is a learning and simulation platform only. No real money is involved and trades do not occur on real markets.`,
    },
    {
      question: 'How does the profit/loss system work?',
      answer:
        'Each stock you hold is compared against its current market price. If the price goes up or down from your purchase price, your portfolio will reflect a gain or loss.',
    },
    {
      question: 'Can I reset my account?',
      answer:
        'Use the Reset Account button at the bottom of the User Profile Page',
    },
    {
      question: 'How do I earn accolades or rewards?',
      answer:
        'Accolades are earned for hitting milestones such as first profit, first $500 gain, etc. A daily/weekly/monthly login streak system rewards users who check in consistently.',
    },
    {
      question: 'Why is there a stock ticker under the navbar?',
      answer:
        'The ticker displays the top gainers and losers of the day, updated daily using public data from Financial Modeling Prep. It helps users quickly spot market trends.',
    },
    {
      question: 'How often is data updated?',
      answer:
        'Stock data is updated in real-time via your API key limits. Ticker data (gainers/losers) is refreshed once daily to avoid overuse of API limits.',
    },
    {
      question: 'Is my data safe?',
      answer:
        'Yes. User data is stored securely in Firebase. API keys are linked only to your account and used solely to fetch your personal market data.',
    },
  ];

  export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);
    const { userData, setUserData } = useUser();
    useEffect(() => {
      const grantNerdBadge = async () => {
        if (!userData?.uid || userData.FirstTime?.includes("faqViewed")) return;
  
        try {
          const userRef = doc(db, "users", userData.uid);
          await updateDoc(userRef, {
            FirstTime: arrayUnion("faqViewed"),
          });
  
          setUserData((prev) => ({
            ...prev,
            FirstTime: [...(prev.FirstTime || []), "faqViewed"],
          }));
  
          toast.success("🧠 Achievement Unlocked: Nerd Badge Earned (FAQ Viewed)!");
        } catch (err) {
          console.error("Error unlocking FAQ badge:", err);
        }
      };
  
      grantNerdBadge();
    }, [userData]);

  
    return (
      <div className="w-full px-4 py-16 dark:bg-black">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 max-w-3xl flex-col flex mx-auto">
          {faqs.map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <div className="rounded-xl bg-white dark:bg-gray-800 shadow-md">
                  <Disclosure.Button
                    onClick={() =>
                      setOpenIndex(open ? null : index)
                    }
                    className="flex w-full justify-between items-center px-6 py-4 text-left text-lg font-medium text-gray-900 dark:text-white focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronUpIcon
                      className={`${
                        openIndex === index ? 'rotate-180 transform' : ''
                      } h-5 w-5 text-yellow-400 transition-transform duration-200`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-4 text-gray-700 dark:text-gray-300 text-sm">
                    {faq.answer}
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    );
  }
