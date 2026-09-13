/**
 * Simple LRU cache with TTL and a stale-while-revalidate window.
 */
export class LRUCache {
    constructor(capacity = 3, defaultTTL = 5, defaultSWR = 10) {
        this.capacity = capacity;
        this.defaultTTL = defaultTTL;
        this.defaultSWR = defaultSWR;
        this.store = new Map();
    }

    /**
     * Returns the cached entry state: FRESH, STALE_BUT_SERVABLE, EXPIRED, or MISS.
     */
    getEntry(key) {
        const item = this.store.get(key);
        if (!item) return { status: "MISS", value: undefined };

        const now = Date.now();
        if (now > item.staleUntil) {
            this.store.delete(key);
            return { status: "EXPIRED", value: undefined };
        }

        this.store.delete(key);
        this.store.set(key, item);

        return {
            status: now <= item.expiresAt ? "FRESH" : "STALE_BUT_SERVABLE",
            value: item.value,
            expiresAt: item.expiresAt,
            staleUntil: item.staleUntil,
        };
    }

    get(key) {
        const entry = this.getEntry(key);
        return entry.status === "FRESH" || entry.status === "STALE_BUT_SERVABLE"
            ? entry.value
            : undefined;
    }

    /**
     * Add or update an item with TTL. Evicts least recently used item if at capacity.
     */
    set(key, value, ttl = this.defaultTTL, swr = this.defaultSWR) {
        if (this.store.has(key)) {
            this.store.delete(key);
        }

        const expiresAt = Date.now() + ttl * 1000;
        this.store.set(key, {
            value,
            expiresAt,
            staleUntil: expiresAt + swr * 1000,
        });

        // If over capacity, evict oldest (first inserted) item
        if (this.store.size > this.capacity) {
            const oldestKey = this.store.keys().next().value;
            this.store.delete(oldestKey);
            return oldestKey;
        }

        return null;
    }

    // Public cache API name. `set` remains for existing simulation code.
    put(key, value, ttl = this.defaultTTL, swr = this.defaultSWR) {
        return this.set(key, value, ttl, swr);
    }

    /**
     * Check if key is fresh or can be served during its SWR window.
     */
    has(key) {
        const entry = this.getEntry(key);
        return entry.status === "FRESH" || entry.status === "STALE_BUT_SERVABLE";
    }

    /**
     * Delete a key
     */
    delete(key) {
        return this.store.delete(key);
    }

    // Manual invalidation is explicit; it is not automatic LRU eviction.
    invalidate(key) {
        return this.delete(key);
    }

    /**
     * Clear the cache
     */
    clear() {
        this.store.clear();
    }

    /**
     * Return all active keys
     */
    keys() {
        for (const [key, item] of this.store.entries()) {
            if (Date.now() > item.staleUntil) {
                this.store.delete(key);
            }
        }
        return [...this.store.keys()];
    }
}
