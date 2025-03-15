export class Cache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const queryCache = new Cache();