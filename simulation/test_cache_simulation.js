import { TTLCache } from "./cache/TTL.js";
import { LRUCache } from "./cache/LRUcache.js";
import { LFUCache } from "./cache/LFUcache.js";
import { createTopology } from "./createtopology.js";
import { Request } from "./Request.js";
import { RoutingEngine } from "./RoutingEngine.js";
import { RoundRobin } from "./routing/roundrobin.js";
import { WeightedRouting } from "./routing/WeightedRouting.js";
import { LeastLoadedRouting } from "./routing/LeastLoadedRouting.js";

async function test() {
    console.log("=== Testing CDN Cache and Routing Engine ===");

    // 1. TTLCache test
    const ttl = new TTLCache(1); // 1s TTL
    ttl.set("k1", "v1");
    console.assert(ttl.get("k1") === "v1", "TTLCache hit failed");
    await new Promise(r => setTimeout(r, 1100));
    console.assert(ttl.get("k1") === undefined, "TTLCache expire failed");
    console.log("✓ TTLCache passed");

    // 2. LRUCache with SWR & TTL
    const lru = new LRUCache(2, 1, 2); // 1s TTL, 2s SWR
    lru.set("a", 1);
    console.assert(lru.getEntry("a").status === "FRESH", "LRU fresh status failed");
    console.assert(lru.get("a") === 1, "LRU get failed");
    await new Promise(r => setTimeout(r, 1100));
    console.assert(lru.getEntry("a").status === "STALE_BUT_SERVABLE", "LRU stale status failed");
    console.assert(lru.get("a") === 1, "LRU stale get failed");
    console.log("✓ LRUCache passed");

    // 3. LFUCache with SWR & TTL
    const lfu = new LFUCache(2, 1, 2);
    lfu.set("x", 10);
    console.assert(lfu.getEntry("x").status === "FRESH", "LFU fresh status failed");
    console.assert(lfu.get("x") === 10, "LFU get failed");
    await new Promise(r => setTimeout(r, 1100));
    console.assert(lfu.getEntry("x").status === "STALE_BUT_SERVABLE", "LFU stale status failed");
    console.assert(lfu.get("x") === 10, "LFU stale get failed");
    console.log("✓ LFUCache passed");

    // 4. Routing Engine test
    const topology = createTopology();
    const router = new RoutingEngine(topology);

    const hitResult = router.route(new Request("r1", "/image.jpg", "Delhi"), "edge-1");
    console.assert(hitResult.status === "EDGE_CACHE_HIT", "Edge cache hit failed");

    const fallbackResult = router.route(new Request("r2", "/manual.pdf", "Delhi"), "edge-1");
    console.assert(fallbackResult.status === "ORIGIN_FALLBACK", "Origin fallback failed");

    console.log("✓ RoutingEngine passed");

    // 5. Round Robin test
    const rr = new RoundRobin(topology);
    const selectedEdges = [
        rr.getNextNode().id,
        rr.getNextNode().id,
        rr.getNextNode().id,
        rr.getNextNode().id,
    ];
    console.assert(
        selectedEdges[0] === "edge-1" &&
        selectedEdges[1] === "edge-2" &&
        selectedEdges[2] === "edge-3" &&
        selectedEdges[3] === "edge-1",
        `Round Robin sequence failed: ${JSON.stringify(selectedEdges)}`
    );
    console.log("✓ RoundRobin passed");

    // 6. Weighted Routing test
    const wr = new WeightedRouting(topology, {
        "edge-1": 3,
        "edge-2": 1,
        "edge-3": 2,
    });
    const weightedSequence = [];
    for (let i = 0; i < 6; i++) {
        weightedSequence.push(wr.getNextNode().id);
    }
    const countEdge1 = weightedSequence.filter(id => id === "edge-1").length;
    const countEdge2 = weightedSequence.filter(id => id === "edge-2").length;
    const countEdge3 = weightedSequence.filter(id => id === "edge-3").length;
    console.assert(countEdge1 === 3, `Edge-1 expected 3 hits, got ${countEdge1}`);
    console.assert(countEdge2 === 1, `Edge-2 expected 1 hit, got ${countEdge2}`);
    console.assert(countEdge3 === 2, `Edge-3 expected 2 hits, got ${countEdge3}`);
    console.log("✓ WeightedRouting passed");

    // 7. Least Loaded Routing test
    const ll = new LeastLoadedRouting(topology, {
        "edge-1": 15,
        "edge-2": 5,
        "edge-3": 20,
    });
    console.assert(ll.getNextNode().id === "edge-2", "Least loaded should select edge-2");
    ll.incrementLoad("edge-2", 20); // edge-2 load is now 25
    console.assert(ll.getNextNode().id === "edge-1", "Least loaded should now select edge-1");
    console.log("✓ LeastLoadedRouting passed");

    console.log("All tests passed cleanly!");
}

test().catch(console.error);



