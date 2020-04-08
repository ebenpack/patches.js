import { uuid, Id } from "./util";

export interface Buffer<T> {
    isEmpty: () => boolean;
    put: (...messages: T[]) => void;
    take: () => T;
    toArray: () => T[];
    flush: () => void;
}

export interface Mailbox {
    id: Id;
    name: string;
    messages: Buffer<any>; // blech
}

export abstract class Node {
    id: Id;
    inputs: Mailbox[];
    outputs: Mailbox[];
    abstract _runTick(time: number): void;

    constructor(inputs: Mailbox[], outputs: Mailbox[]) {
        this.id = uuid();
        this.inputs = inputs;
        this.outputs = outputs;
    }
    runTick(time: number): void {
        // Clear outbox
        this.outputs.forEach((mailbox) => mailbox.messages.flush());
        // Do junk
        this._runTick(time);
        // Clear inbox
        this.inputs.forEach((mailbox) => mailbox.messages.flush());
    }
}
