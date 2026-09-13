/**
 * Simple LFU cache with TTL and a stale-while-revalidate window.
 */
export class LFUCache {
    constructor(capacity = 3, defaultTTL = 5, defaultSWR = 10) {
        this.capacity = capacity;
        this.defaultTTL = defaultTTL;
        this.defaultSWR = defaultSWR;
        this.store = new Map();
        this.clock = 0;
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

        item.frequency += 1;
        item.lastUsed = ++this.clock;
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
     * Add or update an item with TTL. Evicts least frequently used item if full.
     */
    set(key, value, ttl = this.defaultTTL, swr = this.defaultSWR) {
        const expiresAt = Date.now() + ttl * 1000;
        const existing = this.store.get(key);

        if (existing) {
            existing.value = value;
            existing.expiresAt = expiresAt;
            existing.staleUntil = expiresAt + swr * 1000;
            existing.frequency += 1;
            existing.lastUsed = ++this.clock;
            return null;
        }

        let evictedKey = null;

        // Evict if full
        if (this.store.size >= this.capacity) {
            evictedKey = this.getLFUKey();
            if (evictedKey) {
                this.store.delete(evictedKey);
            }
        }

        this.store.set(key, {
            value,
            expiresAt,
            staleUntil: expiresAt + swr * 1000,
            frequency: 1,
            lastUsed: ++this.clock,
        });

        return evictedKey;
    }

    // Public cache API name. `set` remains for existing simulation code.
    put(key, value, ttl = this.defaultTTL, swr = this.defaultSWR) {
        return this.set(key, value, ttl, swr);
    }

    /**
     * Find key with minimum frequency (tie-break with oldest lastUsed)
     */
    getLFUKey() {
        let minKey = null;
        let minEntry = null;

        for (const [key, entry] of this.store) {
            if (
                !minEntry ||
                entry.frequency < minEntry.frequency ||
                (entry.frequency === minEntry.frequency && entry.lastUsed < minEntry.lastUsed)
            ) {
                minKey = key;
                minEntry = entry;
            }
        }

        return minKey;
    }

    /**
     * Check if key exists and is valid
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

    // Manual invalidation is explicit; it is not automatic LFU eviction.
    invalidate(key) {
        return this.delete(key);
    }

    /**
     * Clear the cache
     */
    clear() {
        this.store.clear();
        this.clock = 0;
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
