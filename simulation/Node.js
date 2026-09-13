export class Node {
    constructor(id, name, location, files = []) {
         this.id = id;
         this.name = name;
         this.location = location;
         this.status = "ACTIVE";
         // Fake storage used by the CDN topology simulation.  These are paths,
         // not real files on disk.
         this.files = files;
    }
}
