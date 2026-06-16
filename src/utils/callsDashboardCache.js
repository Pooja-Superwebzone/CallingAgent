const STORAGE_KEY = "calls_dashboard_cache";
const memoryCache = new Map();

export function buildDashboardCacheKey(page, startDate, endDate) {
  return `${page}|${startDate}|${endDate}`;
}

function readStore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn("Failed to persist dashboard cache:", err);
  }
}

export function getDashboardCache(key) {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  const store = readStore();
  if (store[key]) {
    memoryCache.set(key, store[key]);
    return store[key];
  }

  return null;
}

export function setDashboardCache(key, data) {
  memoryCache.set(key, data);
  const store = readStore();
  store[key] = data;
  writeStore(store);
}

export function clearDashboardCache() {
  memoryCache.clear();
  sessionStorage.removeItem(STORAGE_KEY);
}
