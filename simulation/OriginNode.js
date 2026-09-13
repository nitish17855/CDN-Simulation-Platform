import { Node } from "./Node.js";
import { NodeStatus, NodeType } from "../topology/topology.type.js";

/**
 * ==============================================================================
 * ORIGIN NODE SIMULATION MODEL
 * ==============================================================================
 * 
 * An Origin Node represents the authoritative centralized web/storage server
 * containing the master copy of all assets in the CDN network.
 */
export class OriginNode extends Node {
    /**
     * @param {string} id - Unique identifier (e.g. 'origin-1')
     * @param {string} name - Friendly name (e.g. 'Origin-Primary')
     * @param {string} location - Geographical region (e.g. 'Bangalore')
     * @param {string[]} [files=[]] - Authoritative list of assets hosted at origin
     */
    constructor(id, name, location, files = []) {
        super(id, name, location, files);
        this.type = NodeType.ORIGIN;
        this.status = NodeStatus.ACTIVE;
    }
}
