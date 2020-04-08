import { Id, uuid } from "./util";

export class Patch {
    id: Id;
    sourceNodeId: Id;
    sourceOutputId: Id;
    destinationNodeId: Id;
    destinationInputId: Id;
    constructor(
        sourceNodeId: Id,
        sourceOutputId: Id,
        destinationNodeId: Id,
        destinationInputId: Id
    ) {
        // TODO: Put id making into superclass
        this.id = uuid();
        this.sourceNodeId = sourceNodeId;
        this.sourceOutputId = sourceOutputId;
        this.destinationNodeId = destinationNodeId;
        this.destinationInputId = destinationInputId;
    }
}
