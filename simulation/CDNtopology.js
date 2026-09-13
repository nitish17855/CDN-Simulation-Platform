export class CDNTopology {
    constructor() {
        this.EdgeNode = new Map();
        this.OriginNode = new Map();
    }

    addEdge(edge) {
        this.EdgeNode.set(edge.id, edge);
    }

    addOrigin(origin) {
        this.OriginNode.set(origin.id, origin);
    }

    getEdge(id) {
        return this.EdgeNode.get(id);
    }

    getOrigin(id) {
        return this.OriginNode.get(id);
    }

    getAllEdges() {
        return [...this.EdgeNode.values()];
    }

    getAllOrigins() {
        return [...this.OriginNode.values()];
    }

    getSummary() {
        return {
            totalEdges: this.EdgeNode.size,
            totalOrigins: this.OriginNode.size,
            edges: this.getAllEdges(),
            origins: this.getAllOrigins()
        };
    }
}

