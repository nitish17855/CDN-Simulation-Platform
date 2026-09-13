export class RoutingEngine {
    constructor(topology) {
        this.topology = topology;
    }

    /**
     * Route a request through its selected edge node.
     * A cache hit is served by that edge; cache misses (or unavailable edges)
     * fall back to an origin that owns the requested object.
     */
    route(request, edge) {
        const objectKey = this.normalizeObjectKey(request.objectKey);
        const selectedEdge = typeof edge === "string"
            ? this.topology.getEdge(edge)
            : edge;

        if (selectedEdge && this.checkEdgeStatus(selectedEdge)) {
            const hasCachedObject = selectedEdge.files.includes(objectKey);
            if (hasCachedObject) {
                return this.createRouteResult(request, objectKey, selectedEdge, "EDGE_CACHE_HIT");
            }
        }

        const origin = this.topology
            .getAllOrigins()
            .find((node) => node.status === "ACTIVE" && node.files.includes(objectKey));

        if (origin) {
            return this.createRouteResult(request, objectKey, origin, "ORIGIN_FALLBACK");
        }

        return {
            requestId: request.requestId,
            objectKey,
            status: "NOT_FOUND",
            node: null,
        };
    }

    checkEdgeStatus(edge) {
        return edge?.status === "ACTIVE";
    }

    normalizeObjectKey(objectKey) {
        return objectKey.startsWith("/") ? objectKey : `/${objectKey}`;
    }

    createRouteResult(request, objectKey, node, status) {
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
        };
    }
}
