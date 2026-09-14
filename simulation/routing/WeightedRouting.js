/**
 * Weighted Routing strategy for CDN Edge Nodes.
 * Distributes requests proportionally based on node weights/capacities.
 */
export class WeightedRouting {
    /**
     * @param {CDNTopology|Array} topology - CDN topology or list of edge nodes
     * @param {Object} [weights={}] - Optional map of node ID to weight, e.g. { "edge-1": 3, "edge-2": 1 }
     */
    constructor(topology, weights = {}) {
        this.topology = topology;
        this.weights = new Map(Object.entries(weights));
        this.currentWeights = new Map();
    }

    /**
     * Set weight for a specific edge node
     */
    setWeight(nodeId, weight) {
        this.weights.set(nodeId, Math.max(1, weight));
    }

    /**
     * Get configured weight of a node (defaults to node.weight or 1)
     */
    getWeight(node) {
        if (this.weights.has(node.id)) {
            return this.weights.get(node.id);
        }
        return node.weight || 1;
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
     * Select the next edge node using Smooth Weighted Round Robin
     */
    getNextNode() {
        const edges = this.getActiveEdges();
        if (edges.length === 0) return null;

        // Calculate total weight
        let totalWeight = 0;
        for (const edge of edges) {
            totalWeight += this.getWeight(edge);
        }

        // Pick node with highest current accumulated weight
        let selectedNode = null;
        let maxWeight = -Infinity;

        for (const edge of edges) {
            const weight = this.getWeight(edge);
            const current = (this.currentWeights.get(edge.id) || 0) + weight;
            this.currentWeights.set(edge.id, current);

            if (current > maxWeight) {
                maxWeight = current;
                selectedNode = edge;
            }
        }

        if (selectedNode) {
            const current = this.currentWeights.get(selectedNode.id);
            this.currentWeights.set(selectedNode.id, current - totalWeight);
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
     * Reset current accumulated weights
     */
    reset() {
        this.currentWeights.clear();
    }
}

export const WeightedRoundRobin = WeightedRouting;
export const WeightedRouter = WeightedRouting;
