import { Node } from "./Node.js";
export class OriginNode extends Node {
    constructor(id, name, location, files = []) {
           super(id, name, location, files);
           this.type = "Origin";
    }
}
