import { Node } from "./Node.js";
export class EdgeNode extends Node {
    constructor(id, name, location, files = []) {
           super(id, name, location, files);
           this.type = "Edge";
    }
}
