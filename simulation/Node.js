import { NodeStatus } from "../topology/topology.type.js";

/**
 * ==============================================================================
 * BASE NODE MODEL
 * ==============================================================================
 * 
 * Abstract base class representing any network node (Edge or Origin) in the CDN topology.
 */
export class Node {
    /**
     * @param {string} id - Unique identifier
     * @param {string} name - Friendly node name
     * @param {string} location - Geographical location/region
     * @param {string[]} [files=[]] - Associated file paths
     */
    constructor(id, name, location, files = []) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.status = NodeStatus.ACTIVE;
        this.files = files;
    }
}
