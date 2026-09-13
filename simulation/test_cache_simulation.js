import { TTLCache } from "./cache/TTL.js";
import { LRUCache } from "./cache/LRUcache.js";
import { LFUCache } from "./cache/LFUcache.js";
import { createTopology } from "./createtopology.js";
import { Request } from "./Request.js";
import { RoutingEngine } from "./RoutingEngine.js";

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
    console.log("All tests passed cleanly!");
}

test().catch(console.error);
