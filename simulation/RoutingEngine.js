/**
 * CDN Routing Engine
 * Routes requests using fresh, stale-while-revalidate, and origin fallback rules.
 */
import { CacheService } from "./CacheService.js";

export class RoutingEngine {
    constructor(topology) {
        this.topology = topology;
        this.cacheService = new CacheService(topology);
    }

    /**
     * Route a request through an edge node
     */
    route(request, edge) {
        const objectKey = this.normalizeObjectKey(request.objectKey);
        const selectedEdge = typeof edge === "string"
            ? this.topology.getEdge(edge)
            : edge;

        // Count every request so the admission policy can identify popular files.
        const requestFrequency = this.cacheService.recordRequest(objectKey);
        const isEdgeActive = selectedEdge && selectedEdge.status === "ACTIVE";

        // 1. Fresh edge cache entry: return it immediately.
        if (isEdgeActive) {
            const cacheEntry = selectedEdge.getCacheEntry(objectKey);

            if (cacheEntry.status === "FRESH") {
                return this.createRouteResult(request, objectKey, selectedEdge, "EDGE_CACHE_HIT", {
                    cacheStatus: "FRESH",
                    content: cacheEntry.value,
                });
            }

            // 2. Stale entry: serve it now and refresh the cache from Origin.
            if (cacheEntry.status === "STALE_BUT_SERVABLE") {
                const origin = this.cacheService.revalidate(selectedEdge, objectKey);
                return this.createRouteResult(request, objectKey, selectedEdge, "EDGE_CACHE_HIT", {
                    cacheStatus: "STALE_BUT_SERVABLE",
                    content: cacheEntry.value,
                    revalidationTriggered: Boolean(origin),
                });
            }
        }

        // 3. Miss or expired entry: do not serve it; fetch from Origin.
        const origin = this.cacheService.findOrigin(objectKey);

        if (origin) {
            // Only admit popular origin objects into the edge cache.
            const admittedToCache = isEdgeActive && this.cacheService.shouldCache(objectKey);
            if (admittedToCache) {
                selectedEdge.cacheFile(objectKey, objectKey);
            }
            return this.createRouteResult(request, objectKey, origin, "ORIGIN_FALLBACK", {
                cacheStatus: isEdgeActive ? "EXPIRED_OR_MISS" : "EDGE_UNAVAILABLE",
                content: objectKey,
                requestFrequency,
                admittedToCache,
            });
        }

        // 3. Not found
        return {
            requestId: request.requestId,
            objectKey,
            status: "NOT_FOUND",
            node: null,
        };
    }

    normalizeObjectKey(objectKey) {
        if (!objectKey) return "/";
        return objectKey.startsWith("/") ? objectKey : `/${objectKey}`;
    }

    createRouteResult(request, objectKey, node, status, details = {}) {
        return {
            requestId: request.requestId,
            objectKey,
            status,
            node: {
                id: node.id,
                name: node.name,
                type: node.type,
                location: node.location,
            },
            ...details,
        };
    }
}
