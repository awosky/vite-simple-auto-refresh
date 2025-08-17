const EXPIRY_TIME = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

interface StoredValue<T> {
  value: T;
  expiry: number;
}

/**
 * Save data to localStorage with expiry (12 hours by default).
 */
export function setItem<T>(key: string, value: T, ttl: number = EXPIRY_TIME): void {
  const now = Date.now();
  const item: StoredValue<T> = {
    value,
    expiry: now + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Get data from localStorage. Returns null if expired or not found.
 */
export function getItem<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item: StoredValue<T> = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key); // cleanup expired
      return null;
    }
    return item.value;
  } catch (e) {
    console.error("Error parsing localStorage item:", e);
    return null;
  }
}

/**
 * Delete data from localStorage.
 */
export function removeItem(key: string): void {
  localStorage.removeItem(key);
}
