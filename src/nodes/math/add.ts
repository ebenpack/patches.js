import { uuid } from "../../util";
import { Node, Buffer } from "../../node";



class Add extends Node {
    left: number;
    right: number;
    value: number;
    constructor(buffer: () => Buffer<any>, onSend = () => {}, onDelivery = () => {}) {
        const inputs = [
            { id: uuid(), name: 'A', messages: buffer() }, // TODO: Make class
            { id: uuid(), name: 'B', messages: buffer() },
        ];
        const outputs = [
            { id: uuid(), name: 'C', messages: buffer() },
        ];
        super(inputs, outputs);
        this.left = 0;
        this.right = 0;
        this.value = 0;
    }
    private getMessage(index: number, defaultValue: number): number {
        if (!this.inputs[index].messages.isEmpty()) {
            const message = this.inputs[0].messages.take();
            if (Number.isFinite(message)) {
                return message;
            }
        }
        return defaultValue;
    }
    _runTick() {
        
        this.left = this.getMessage(0, this.left);
        this.right = this.getMessage(1, this.right);
        const sum = this.left + this.right;
        if (sum !== this.value) {
            this.outputs[0].messages.put(sum);
        }
    }
}
