import { Id, uuid } from "./util";
import { Patch } from "./patch";
import { Node, Mailbox, Buffer } from "./node";

interface CanvasNodes {
    [propName: string]: Node;
}

interface CanvasPatches {
    [propName: string]: Patch;
}

// TODO: Needs more thought?
interface PatchConnections {
    [propName: string]: { [propName: string]: Id[] }; // Associates node outbox ids to outgoing patches
}
// sourcenodid -> outboxId -> patchId

export class Canvas {
    nodes: CanvasNodes;
    patches: CanvasPatches;
    patchConnections: PatchConnections;
    private running: boolean;
    private animationId: number;
    private pendingMessages: Set<[Id, Id]>;
    constructor() {
        this.nodes = {};
        this.patches = {};
        this.running = false;
        this.animationId = null;
        this.patchConnections = {};
        this.pendingMessages = new Set();
    }
    addNode() {
        const registerTick = (node: Node): Node => {
            const oldRunTick = node.runTick;
            node.runTick = (time: number) => {
                oldRunTick(time);
                node.outputs.forEach((mailbox) => {
                    if (!mailbox.messages.isEmpty) {
                        this.pendingMessages.add([node.id, mailbox.id]);
                    }
                });
            }
            return node;
        };
        // let node = new Node();
        // node = registerTick(registerTick);
        // blah!
    }
    onMessage = (sourceNodeId: Id, sourceOutputId: Id) => {
        this.pendingMessages.add([sourceNodeId, sourceOutputId]);
    };
    connectNodes(
        sourceNodeId: Id,
        sourceOutputId: Id,
        destinationNodeId: Id,
        destinationInputId: Id
    ): void {
        const sourceNode = this.nodes[sourceNodeId];
        const destinationNode = this.nodes[destinationNodeId];
        const sourceOutput = this.findMailbox(sourceNodeId, sourceOutputId);
        const destinationInput = this.findMailbox(
            destinationNodeId,
            destinationInputId
        );
        if (sourceNode && destinationNode && sourceOutput && destinationInput) {
            // TODO: connection check/negotiation?
            const patch = new Patch(
                sourceNodeId,
                sourceOutputId,
                destinationNodeId,
                destinationInputId
            );
            this.patches[patch.id] = patch;
            this.patchConnections[sourceNodeId] =
                this.patchConnections[sourceNodeId] || {};
            this.patchConnections[sourceNodeId][sourceOutputId] =
                this.patchConnections[sourceNodeId][sourceOutputId] || [];
            this.patchConnections[sourceNodeId][sourceOutputId].push(patch.id);
        }
    }
    start() {
        this.running = true;
        this.runTick(window.performance.now());
    }
    stop() {
        this.running = false;
        window.cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }
    private findMailbox(sourceNodeId: Id, sourceMailboxId: Id): Mailbox {
        return this.nodes[sourceNodeId]?.outputs.find(
            (mailbox: Mailbox) => mailbox.id === sourceMailboxId
        );
    }
    runTick(time: number) {
        this.pendingMessages.forEach(([sourceNodeId, sourceOutputId]) => {
            const patches =
                this.patchConnections[sourceNodeId]?.[sourceOutputId] || [];
            patches.forEach((patchId) => {
                const patch = this.patches[patchId];
                if (patch) {
                    const outbox = this.findMailbox(
                        patch.sourceNodeId,
                        patch.sourceOutputId
                    );
                    const inbox = this.findMailbox(
                        patch.destinationNodeId,
                        patch.destinationInputId
                    );
                    if (outbox && inbox) {
                        inbox.messages.put(...outbox.messages.toArray());
                    }
                }
            });
        });
        // Flush pending messages
        this.pendingMessages.clear();
        // Run node logic
        Object.values(this.nodes).forEach((node) => {
            node.runTick(time);
        });
        // Can't stop, won't stop
        if (this.running) {
            this.animationId = window.requestAnimationFrame(this.runTick); // TODO: bind?
        }
    }
}
