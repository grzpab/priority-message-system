import { Logger } from 'pino';
import type { Consumer, Produce } from "./broker";
import { ConsumerStrategy } from "./consumerStrategies/consumerStrategy";

export class MessageProcessingError extends Error {}

export abstract class AbstractCustomConsumer<M> implements Consumer {
    protected readonly logger: Logger;
    protected produce?: Produce;

    public constructor(
        readonly parentLogger: Logger,
        protected readonly consumerStrategy: ConsumerStrategy<M>,
    ) {
        this.logger = parentLogger.child({ class: this.constructor.name });
    }

    public setProduce(produce: Produce): void {
        this.produce = produce;
    }

    public consume(encodedMessages: ReadonlyArray<string>): void {
        this.logger.debug('Consuming messages');

        for (const encodedMessage of encodedMessages) {
            try {
                this.consumeMessage(encodedMessage);
            } catch (error) {
                this.logger.error({ encodedMessage, error}, 'Error while consuming a message');
            }
        }
    }

    protected consumeMessage(encodedMessage: string): void {
        this.logger.debug({ encodedMessage }, 'Consuming a message');

        const message = this.decodeMessage(encodedMessage);

        try {
            this.consumerStrategy.assertCanProcessMessage(message);
            this.processMessage(message);
        } catch (error) {
            if (!(error instanceof MessageProcessingError)) {
                this.logger.error({ message, error }, 'Message processing failed with a unrecoverable error.');
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
