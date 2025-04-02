import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import StockCard from "./StockCard";
import { API_BASE } from "../../utils/api";

const StockWatch = ({ PROPSYMBOLS }) => {
  const [prices, setPrices] = useState(() => {
    const initial = {};
    PROPSYMBOLS.forEach((s) => (initial[s] = null));
    return initial;
  });

  useEffect(() => {
    const auth = getAuth();
    let socket;
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
  
      user.getIdToken().then((token) => {
        
      socket = new WebSocket(`${API_BASE.replace(/^http/, "ws")}?token=${token}`);
  
        socket.addEventListener("message", (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "trade") {
              data.data.forEach(({ s: symbol, p: price }) => {
                setPrices((prev) => ({ ...prev, [symbol]: price }));
              });
            }
          } catch (err) {
            console.error("❌ Error parsing WS message:", err);
          }
        });
  
        socket.addEventListener("open", () => {
          // console.log("✅ Connected to backend WebSocket");
          setTimeout(() => {
            PROPSYMBOLS.forEach((symbol) => {
              const msg = JSON.stringify({ type: "subscribe", symbol });
              // console.log("📤 Subscribing to:", msg);
              socket.send(msg);
            });
          }, 100);
        });
  
        socket.addEventListener("close", () => {
          console.log("❌ WebSocket connection closed");
        });
      });
    });
  
    return () => {
      unsubscribe(); // clean up auth listener
      if (socket && socket.readyState === WebSocket.OPEN) {
        PROPSYMBOLS.forEach((symbol) => {
          socket.send(JSON.stringify({ type: "unsubscribe", symbol }));
        });
        socket.close();
        console.log("📴 Unsubscribed and closed WebSocket");
      }
    };
  }, [PROPSYMBOLS]);

  return (
    <div className="cards flex gap-10 items-center justify-center pt-10 pb-30 flex-wrap">
      {Object.entries(prices).map(([symbol, price]) => (
        <StockCard key={symbol} symbol={symbol} price={price} />
      ))}
    </div>
  );
};

export default StockWatch;