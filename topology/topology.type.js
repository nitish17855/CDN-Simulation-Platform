/**
 * ==============================================================================
 * CDN TOPOLOGY TYPE DEFINITIONS & CONSTANTS
 * ==============================================================================
 * 
 * Provides centralized enumerations and constants for the CDN simulation platform:
 * - NodeStatus: Lifecycle & health states of nodes (ACTIVE, INACTIVE, etc.)
 * - NodeType: Node classification (Edge vs. Origin)
 * - CacheAlgorithm: Supported caching algorithms (LRU, LFU, TTL)
 * - RouteStatus: Decision outcomes from the Routing Engine
 */

export const NodeStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    MAINTENANCE: 'MAINTENANCE',
    OFFLINE: 'OFFLINE',
};

export const NodeType = {
    EDGE: 'Edge',
    ORIGIN: 'Origin',
};

export const CacheAlgorithm = {
    LRU: 'LRU',
    LFU: 'LFU',
    TTL: 'TTL',
};

export const RouteStatus = {
    EDGE_CACHE_HIT: 'EDGE_CACHE_HIT',
    ORIGIN_FALLBACK: 'ORIGIN_FALLBACK',
    NOT_FOUND: 'NOT_FOUND',
};
