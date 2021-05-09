import { Logger } from "pino";
import { MessageProcessingError } from "../abstractCustomConsumer";
import { ConsumerStrategy } from "./consumerStrategy";
import type { Message } from "../message";

class MessageHasHighTtlError extends MessageProcessingError {}
class MessageHasLowTtlError extends MessageProcessingError {}

export class TtlConsumerStrategy implements ConsumerStrategy<Message> {
    private readonly logger: Logger;

    public constructor(
        parentLogger: Logger,
        protected readonly lowTtl: number,
        protected readonly highTtl: number,
    ) {
        this.logger = parentLogger.child({ class: this.constructor.name });
    }

    public assertCanProcessMessage(message: Message): void {
        this.logger.debug({ message }, "Asserting if the consumer can process this message");

        if (message.ttl <= this.lowTtl) {
            throw new MessageHasLowTtlError();
        }

        if (message.ttl >= this.highTtl) {
            throw new MessageHasHighTtlError();
        }
    }

    public buildPostponedMessage(message: Message, error: MessageProcessingError): Message {
        this.logger.debug({ message, error }, "Building a postponed message");

        if (error instanceof MessageHasLowTtlError) {
            throw error;
        }

        return {
            ...message,
            ttl: message.ttl - 1
        };
    }
}
