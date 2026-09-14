/**
 * Least Loaded routing strategy for CDN Edge Nodes.
 * Directs traffic to the edge node with the lowest current load or active connection count.
 */
export class LeastLoadedRouting {
    /**
     * @param {CDNTopology|Array} topology - CDN topology or list of edge nodes
     * @param {Object} [initialLoads={}] - Optional initial load map, e.g. { "edge-1": 10, "edge-2": 2 }
     */
    constructor(topology, initialLoads = {}) {
        this.topology = topology;
        this.loads = new Map(Object.entries(initialLoads));
    }

    /**
     * Set load for a specific node
     */
    setLoad(nodeId, load) {
        this.loads.set(nodeId, Math.max(0, load));
    }

    /**
     * Get current load of a node
     */
    getLoad(node) {
        const id = typeof node === "string" ? node : node.id;
        if (this.loads.has(id)) {
            return this.loads.get(id);
        }
        return (typeof node === "object" && node.load) ? node.load : 0;
    }

    /**
     * Increment active load on a node
     */
    incrementLoad(nodeId, delta = 1) {
        const current = this.getLoad(nodeId);
        this.loads.set(nodeId, current + delta);
    }

    /**
     * Decrement active load on a node
     */
    decrementLoad(nodeId, delta = 1) {
        const current = this.getLoad(nodeId);
        this.loads.set(nodeId, Math.max(0, current - delta));
    }

    /**
     * Get all active edge nodes from the topology
     */
    getActiveEdges() {
        if (!this.topology) return [];
        const edges = Array.isArray(this.topology)
            ? this.topology
            : this.topology.getAllEdges();

        return edges.filter((edge) => edge.status === "ACTIVE");
    }

    /**
     * Select the edge node with the lowest current load
     */
    getNextNode() {
        const edges = this.getActiveEdges();
        if (edges.length === 0) return null;

        let selectedNode = null;
        let minLoad = Infinity;

        for (const edge of edges) {
            const load = this.getLoad(edge);
            if (load < minLoad) {
                minLoad = load;
                selectedNode = edge;
            }
        }

        return selectedNode;
    }

    /**
     * Alias for getNextNode
     */
    getNextEdge() {
        return this.getNextNode();
    }

    /**
     * Alias for getNextNode
     */
    selectEdge() {
        return this.getNextNode();
    }

    /**
     * Reset all tracked loads
     */
    reset() {
        this.loads.clear();
    }
}

export const LeastLoaded = LeastLoadedRouting;
export const LeastLoadedRouter = LeastLoadedRouting;