import { Node } from "./Node.js";
import { LRUCache } from "./cache/LRUcache.js";
import { LFUCache } from "./cache/LFUcache.js";

/**
 * Edge Node in the CDN topology.
 * Uses an in-memory cache (LRU or LFU) with TTL support.
 */
export class EdgeNode extends Node {
    constructor(id, name, location, files = [], options = {}) {
        super(id, name, location, []);
        this.type = "Edge";

        const {
            cacheType = "LRU",
            capacity = 10,
            defaultTTL = 3600,
            defaultSWR = 300,
        } = options;

        this.cacheType = cacheType;
        this.defaultTTL = defaultTTL;
        this.defaultSWR = defaultSWR;

        // Initialize cache engine
        this.cache = cacheType === "LFU"
            ? new LFUCache(capacity, defaultTTL, defaultSWR)
            : new LRUCache(capacity, defaultTTL, defaultSWR);

        // Preload initial files into cache
        if (Array.isArray(files)) {
            for (const file of files) {
                this.cache.set(file, file, defaultTTL);
            }
        }
    }

    /**
     * Active cached files
     */
    get files() {
        return this.cache ? this.cache.keys() : [];
    }

    set files(newFiles) {
        if (!this.cache) return;
        this.cache.clear();
        if (Array.isArray(newFiles)) {
            for (const file of newFiles) {
                this.cache.set(file, file, this.defaultTTL);
            }
        }
    }

    /**
     * Cache a file with TTL
     */
    cacheFile(objectKey, content = objectKey, ttl = this.defaultTTL, swr = this.defaultSWR) {
        return this.cache.put(objectKey, content, ttl, swr);
    }

    /**
     * Check if a file is in cache and valid
     */
    hasFile(objectKey) {
        return this.cache.has(objectKey);
    }

    /**
     * Get a file from cache
     */
    getFile(objectKey) {
        return this.cache.get(objectKey);
    }

    getCacheEntry(objectKey) {
        return this.cache.getEntry(objectKey);
    }

    // Called when an admin changes or removes an object at Origin.
    invalidateFile(objectKey) {
        return this.cache.invalidate(objectKey);
    }
}
