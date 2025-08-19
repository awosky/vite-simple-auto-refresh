import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const REFRESH_KEY = "auto-refresh-interval";
const WAKELOCK_KEY = "wake-lock-enabled";

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [intervalSec, setIntervalSec] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedInterval = localStorage.getItem(REFRESH_KEY);
    if (storedInterval) {
      const sec = parseInt(storedInterval, 10);
      if (!isNaN(sec) && sec > 0) {
        setIntervalSec(sec);
        setCountdown(sec);
      }
    }

    const storedWakeLock = localStorage.getItem(WAKELOCK_KEY);
    if (storedWakeLock === "true") {
      requestWakeLock();
    }
  }, []);

  // Setup auto refresh timer
  useEffect(() => {
    if (!intervalSec) return;

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

  // --- Wake Lock Functions ---
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator && document.visibilityState === "visible") {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        setWakeLockActive(true);
        localStorage.setItem(WAKELOCK_KEY, "true");

        wakeLockRef.current.addEventListener("release", () => {
          setWakeLockActive(false);
        });
      }
    } catch (err) {
      console.error("Wake Lock error:", err);
      setWakeLockActive(false);
      localStorage.setItem(WAKELOCK_KEY, "false");
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const disableWakeLock = async () => {
    releaseWakeLock();
    localStorage.setItem(WAKELOCK_KEY, "false");
  };

  // Re-request when tab becomes visible again (if active)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && localStorage.getItem(WAKELOCK_KEY) === "true") {
        requestWakeLock();
      } else if (localStorage.getItem(WAKELOCK_KEY) === "false") {
        releaseWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [wakeLockActive]);

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
            <p>📺 Keep Screen Awake: {wakeLockActive ? "✅ Enabled" : "❌ Disabled"}</p>

            <div className="button-group">
              <button
                onClick={wakeLockActive ? disableWakeLock : requestWakeLock}
                className={`btn btn-toggle ${wakeLockActive ? "" : "nonactive"}`}
              >
                {wakeLockActive ? "🔕 Disable Wake Lock" : "🔔 Enable Wake Lock"}
              </button>

              <button onClick={handleClear} className="btn btn-clear">
                ❌ Clear Timer
              </button>
            </div>
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
