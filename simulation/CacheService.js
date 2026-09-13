/**
 * Small service between an Edge cache and the Origin.
 * It refreshes an edge entry with the origin's authoritative object.
 */
export class CacheService {
    constructor(topology, admissionThreshold = 2) {
        this.topology = topology;
        // An object must be requested this many times before an edge stores it.
        this.admissionThreshold = admissionThreshold;
        // Keeps a simple request count for each object key.
        this.requestFrequency = new Map();
    }

    findOrigin(objectKey) {
        return this.topology
            .getAllOrigins()
            .find((origin) => origin.status === "ACTIVE" && origin.files.includes(objectKey));
    }

    revalidate(edge, objectKey) {
        const origin = this.findOrigin(objectKey);
        if (!origin) return null;

        edge.cacheFile(objectKey, objectKey);
        return origin;
    }

    recordRequest(objectKey) {
        const frequency = (this.requestFrequency.get(objectKey) || 0) + 1;
        this.requestFrequency.set(objectKey, frequency);
        return frequency;
    }

    shouldCache(objectKey) {
        // Low-frequency objects stay at Origin instead of using edge cache space.
        return (this.requestFrequency.get(objectKey) || 0) >= this.admissionThreshold;
    }

    // Manual invalidation: remove one object now, without waiting for TTL.
    invalidate(edge, objectKey) {
        if (!edge || edge.status !== "ACTIVE") return false;
        return edge.invalidateFile(objectKey);
    }
}
