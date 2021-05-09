import type { Consumer, Produce } from "./broker";
import { ConsumerStrategy } from "./consumerStrategies/consumerStrategy";

export class MessageProcessingError extends Error {}

export abstract class AbstractCustomConsumer<M> implements Consumer {
    private produce?: Produce;

    public constructor(
        protected readonly consumerStrategy: ConsumerStrategy<M>,
    ) {
    }

    public setProduce(produce: Produce): void {
        this.produce = produce;
    }

    public consume(encodedMessages: ReadonlyArray<string>): void {
        for (const encodedMessage of encodedMessages) {
            try {
                this.consumeMessage(encodedMessage);
            } catch (error) {
                console.error(error);
            }
        }
    }

    protected consumeMessage(encodedMessage: string): void {
        const message = this.decodeMessage(encodedMessage);

        try {
            this.consumerStrategy.assertCanProcessMessage(message);
            this.processMessage(message);
        } catch (error) {
            if (!(error instanceof MessageProcessingError)) {
                return;
            }

            const newMessage = this.consumerStrategy.buildPostponedMessage(message, error);
            const newEncodedMessage = this.encodeMessage(newMessage);

            this.produce?.(newEncodedMessage);
        }
    }

    protected abstract processMessage(message: M): void;
    protected abstract decodeMessage(encodedMessage: string): M;
    protected abstract encodeMessage(message: M): string;
}
