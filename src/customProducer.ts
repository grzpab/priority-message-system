import type { Broker } from "./broker";

export class CustomProducer {
    private readonly broker: Broker;

    public constructor(broker: Broker) {
        this.broker = broker;
    }

    public produce(message: string): void {
        this.broker.receive(message);
    }
}
