/**
 * Simple TTL (Time-To-Live) Cache
 * Stores key-value pairs with an expiration time (in seconds).
 */
export class TTLCache {
    constructor(defaultTTL = 5) {
        this.defaultTTL = defaultTTL; // TTL in seconds
        this.store = new Map();
    }

    /**
     * Store a key with value and expiration time
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiresAt = Date.now() + ttl * 1000;
        this.store.set(key, { value, expiresAt });
    }

    /**
     * Retrieve a key; if expired, delete and return undefined
     */
    get(key) {
        const item = this.store.get(key);
        if (!item) return undefined;

        // Expired check
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return undefined;
        }

        return item.value;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key) {
        return this.get(key) !== undefined;
    }

    /**
     * Delete a key
     */
    delete(key) {
        return this.store.delete(key);
    }

    /**
     * Clear all cached keys
     */
    clear() {
        this.store.clear();
    }

    /**
     * Get all active keys
     */
    keys() {
        // Remove expired keys
        for (const [key, item] of this.store.entries()) {
            if (Date.now() > item.expiresAt) {
                this.store.delete(key);
            }
        }
        return [...this.store.keys()];
    }
}
