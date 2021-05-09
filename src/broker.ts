import Timeout = NodeJS.Timeout;

export type Produce = (message: string) => void;

export interface Consumer {
    setProduce(produce: Produce): void;
    consume(messages: ReadonlyArray<string>): void;
}

export class Broker {
    protected currentConsumerIndex = 0;
    protected queue = new Array<string>();
    protected idleLoopCount = 0;
    protected readonly timeout: Timeout;

    public constructor(
        protected readonly consumers: ReadonlyArray<Consumer>,
        protected readonly maxQueueSize: number,
        protected readonly maxIdleLoopCount: number,
        protected readonly interval: number,
        protected readonly onExit: () => void,
    ) {
        const produce = (message: string) => this.receive(message);

        this.consumers.forEach((consumer) => consumer.setProduce(produce));

        this.timeout = setInterval(
            () => this.forwardMessages(),
            this.interval,
        );
    }

    public receive(message: string): void {
        this.queue.push(message);
    }

    protected forwardMessages(): void {
        if (this.consumers.length === 0 || this.queue.length === 0) {
            if (++this.idleLoopCount === this.maxIdleLoopCount) {
                clearInterval(this.timeout);
                this.onExit();
            }

            return;
        }

        while(this.queue.length > 0) {
            const oldMessages = this.queue.slice(0, this.maxQueueSize);
            this.queue = this.queue.slice(oldMessages.length);

            this.getCurrentConsumer().consume(oldMessages);
        }
    }

    protected getCurrentConsumer(): Consumer {
        this.currentConsumerIndex = this.currentConsumerIndex < this.consumers.length ?
            this.currentConsumerIndex :
            0;

        return this.consumers[this.currentConsumerIndex++];
    }
}
