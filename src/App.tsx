import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const REFRESH_KEY = "auto-refresh-interval";

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [intervalSec, setIntervalSec] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(REFRESH_KEY);
    if (stored) {
      const sec = parseInt(stored, 10);
      if (!isNaN(sec) && sec > 0) {
        setIntervalSec(sec);
        setCountdown(sec);
      }
    }
  }, []);

  // Setup auto refresh timer
  useEffect(() => {
    if (!intervalSec) return;

    // countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (!prev) return intervalSec;
        if (prev <= 1) {
          window.location.reload();
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [intervalSec]);

  // Handle save
  const handleSave = () => {
    const sec = parseInt(inputValue, 10);
    if (!isNaN(sec) && sec > 0) {
      localStorage.setItem(REFRESH_KEY, sec.toString());
      setIntervalSec(sec);
      setCountdown(sec);
      setInputValue("");
    } else {
      alert("Please enter a valid number of seconds");
    }
  };

  // Allow reset
  const handleClear = () => {
    localStorage.removeItem(REFRESH_KEY);
    setIntervalSec(null);
    setCountdown(null);
  };

  // Only allow numbers in input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <div className="auto-refresh-card">
        {intervalSec ? (
          <div>
            <h3>🔄 Auto Refresh Active</h3>
            <p>
              Refreshing every <b>{intervalSec}</b> seconds
            </p>
            <p className="countdown">Next refresh in: {countdown}s</p>
            <button onClick={handleClear} className="btn btn-clear">
              ❌ Clear Timer
            </button>
          </div>
        ) : (
          <div>
            <h3>Set Auto Refresh</h3>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter seconds"
              className="auto-refresh-input"
            />
            <button onClick={handleSave} className="btn btn-save">
              ✅ Save
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
