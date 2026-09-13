import { EdgeNode } from "./EdgeNode.js";
import { OriginNode } from "./OriginNode.js";
import { CDNTopology } from "./CDNtopology.js";

export function createTopology() {
    const topology = new CDNTopology();

    const edge1 = new EdgeNode(
        "edge-1",
        "Edge-1",
        "Delhi",
        ["/image.jpg", "/logo.png", "/styles.css"]
    );

    const edge2 = new EdgeNode(
        "edge-2",
        "Edge-2",
        "Mumbai",
        ["/video.mp4", "/image.jpg", "/app.js"]
    );

    const edge3 = new EdgeNode(
        "edge-3",
        "Edge-3",
        "Bangalore",
        ["/logo.png", "/manual.pdf", "/styles.css"]
    );

    const origin1 = new OriginNode(
        "origin-1",
        "Origin-1",
        "Bangalore",
        [
            "/image.jpg",
            "/video.mp4",
            "/logo.png",
            "/styles.css",
            "/app.js",
            "/manual.pdf",
        ]
    );

    topology.addEdge(edge1);
    topology.addEdge(edge2);
    topology.addEdge(edge3);
    topology.addOrigin(origin1);

    return topology;
}

