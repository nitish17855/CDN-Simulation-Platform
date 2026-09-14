/**
 * Round Robin routing strategy for CDN Edge Nodes.
 * Distributes requests evenly across available edge nodes in a circular order.
 */
export class RoundRobin {
    constructor(topology) {
        this.topology = topology;
        this.currentIndex = 0;
    }

    /**
     * Get all active edge nodes from the topology
     */
    getActiveEdges() {
        if (!this.topology) return [];
        const edges = Array.isArray(this.topology)
            ? this.topology
            : this.topology.getAllEdges();

        return edges.filter(edge => edge.status === "ACTIVE");
    }

    /**
     * Get the next edge node in round robin order
     */
    getNextNode() {
        const edges = this.getActiveEdges();
        if (edges.length === 0) return null;

        const node = edges[this.currentIndex % edges.length];
        this.currentIndex = (this.currentIndex + 1) % edges.length;
        return node;
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
     * Reset the round robin index
     */
    reset() {
        this.currentIndex = 0;
    }
}
